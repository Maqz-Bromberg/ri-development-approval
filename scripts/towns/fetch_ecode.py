#!/usr/bin/env python3
"""Download the zoning ordinance (and subdivision and land development chapters) of each town on eCode360, for reading.

usage: fetch_ecode.py [TOWN ...] [--cache DIR]      (no TOWN: every town below; DIR defaults to .sources)

Writes .sources/<town>/ordinance/ecode-<guid>.html and .txt for each chapter, from eCode360's print view (one request
for a whole chapter), and ecode-att-<n>.pdf and .txt for each attachment the chapter lists (use tables and other
schedules are often attachments). A chapter already in hand is not fetched again. Then writes .sources/ECODE.md: a
survey of each town's ordinance, with markers for the things that would not fit the site's present form.

These are copies to read, not cited sources: a passage becomes a source in lib/data/sources.ts when it is read into
the data (ARD D9, D34). eCode360 answers an honest User-Agent; the script pauses two seconds between requests.
The list of towns is General Code's own (generalcode.com/source-library/?state=RI), checked 2026-11-14, with Lincoln's
code as the Secretary of State lists it. For four towns the Secretary of State lists another host (NOT_OFFICIAL): their
eCode360 copies are taken, and marked in the survey, because they may not be current.
"""
import html, pathlib, re, subprocess, sys, time, urllib.error, urllib.parse, urllib.request

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import sourcelib as sl

UA = {"User-Agent": "ri-plan-approval/1.0 (public records)"}
BASE = "https://ecode360.com"
ECODE = {
    "Barrington": "BA1328", "Charlestown": "CH1115", "Coventry": "CO1733", "Cranston": "CR6930", "Cumberland": "CU3602",
    "East Greenwich": "EA2109", "Glocester": "GL2062", "Johnston": "JO1987", "Lincoln": "LI1805", "Little Compton": "LI4093",
    "New Shoreham": "NE4081", "North Smithfield": "NO4256", "Pawtucket": "PA1467", "Portsmouth": "PO2650", "Scituate": "SC4136",
    "Smithfield": "SM2013", "West Greenwich": "WE3645", "Westerly": "WE1997",
}
NOT_OFFICIAL = {"Cranston", "New Shoreham", "North Smithfield", "Scituate"}
CHAPTER = re.compile(r"zoning|subdivision|land development", re.I)

# Things in an ordinance that the site's present form does not handle, or handles in one way only. Each is a regex
# counted over the chapter text; the survey shows the counts so a reader can see which town strains the form most.
MARKERS = {
    "form-based": r"form[- ]based|transect|regulating plan",
    "village district": r"village (?:center|district|overlay)",
    "overlay": r"overlay",
    "historic": r"historic district",
    "planned development": r"planned (?:unit|village|development) (?:district|development)|PUD\b|PVD\b",
    "use by number": r"use code|use group \d|\buse no\.",
    "special permit (not SUP)": r"special (?:exception|permit)\b",
    "floor area ratio": r"floor area ratio|\bFAR\b",
    "development plan review": r"development plan review",
    "unified development review": r"unified development review",
    "inclusionary": r"inclusionary",
    "coastal (CRMC)": r"\bCRMC\b|coastal resources management",
    "septic / OWTS": r"\bOWTS\b|septic|onsite wastewater",
    "groundwater / aquifer": r"aquifer|groundwater (?:protection|recharge)|wellhead",
    "minor thresholds raised": r"minor land development[^.]{0,200}(?:\d{1,3},\d{3}|\b\d{2,3}\b) (?:square feet|units|dwelling)",
}


def get(url, tries=4):
    """A page, pausing two seconds after each request. eCode360 answers 429 after a burst: wait a minute and try again."""
    for n in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
                data = r.read()
            time.sleep(2)
            return data
        except urllib.error.HTTPError as e:
            if e.code != 429 or n == tries - 1: raise
            time.sleep(60 * (n + 1))


def text_of(page):
    x = re.sub(r"<script.*?</script>|<style.*?</style>", " ", page, flags=re.S)
    x = re.sub(r"<(?:br|p|div|li|tr|h\d)[^>]*>", "\n", x)
    x = html.unescape(re.sub(r"<[^>]+>", " ", x))
    return re.sub(r"[ \t]+", " ", re.sub(r"\n\s*\n+", "\n\n", x)).strip()


def entries(where):
    """The contents listed on a code's page or a division's: (title, guid, type)."""
    raw = get(f"{BASE}/{where}").decode("utf-8", "replace")
    page = html.unescape(raw)
    out = []
    # A division's page lists its chapters in the markup: data-guid, data-full-title, data-code-content-type.
    for g, t, k in re.findall(r'data-guid="(\d+)"\s+data-position="\d+"\s+data-full-title="([^"]*)"\s+data-code-content-type="([^"]*)"', raw):
        if (html.unescape(t), g, k) not in out: out.append((html.unescape(t), g, k))
    for blk in re.findall(r"\{[^{}]*?\"title\":\"[^\"]*\"[^{}]*?\}", page):
        t, g, k = (re.search(rx, blk) for rx in (r"\"title\":\"([^\"]*)\"", r"\"guid\":\"(\d+)\"", r"\"type\":\"([^\"]*)\""))
        if t and g: out.append((t.group(1), g.group(1), k.group(1) if k else ""))
    return out


def chapters(code):
    """The zoning and subdivision chapters of a town's code, as (title, guid). Some codes list chapters at the top;
    others list divisions (General Legislation, Appendix) with the chapters inside, so divisions are opened once."""
    out, top = [], entries(code)
    for t, g, k in top:
        if CHAPTER.search(t) and k != "division" and (t, g) not in out: out.append((t, g))
    if not any(re.search("zoning", t, re.I) for t, _ in out):
        for t, g, k in top:
            if k == "division" and not re.search(r"derivation|disposition|charter|administrative", t, re.I):
                for t2, g2, k2 in entries(g):
                    if CHAPTER.search(t2) and (t2, g2) not in out and g2 != g: out.append((t2, g2))
    return out


def fetch_town(town, cache):
    code, home = ECODE[town], cache / sl.slug(town) / "ordinance"
    home.mkdir(parents=True, exist_ok=True)
    found = chapters(code)
    for title, guid in found:
        txt = home / f"ecode-{guid}.txt"
        if txt.exists(): continue
        page = get(f"{BASE}/print/{code}?guid={guid}&children=true").decode("utf-8", "replace")
        (home / f"ecode-{guid}.html").write_text(page)
        txt.write_text(f"{town}: {title} (eCode360 {code}, guid {guid})\n\n{text_of(page)}")
        # Attachments are listed on the chapter's own page, not always in the print view.
        listing = get(f"{BASE}/{guid}").decode("utf-8", "replace") + page
        atts = list(dict.fromkeys(re.findall(r'href="(/attachment/[^"]+?\.pdf)"', listing, flags=re.I)))
        for n, href in enumerate(atts, 1):
            pdf = home / f"ecode-{guid}-att{n}.pdf"
            if pdf.exists(): continue
            pdf.write_bytes(get(BASE + urllib.parse.quote(html.unescape(href))))
            subprocess.run(["pdftotext", "-layout", str(pdf), str(pdf.with_suffix(".txt"))], check=False)
            name = urllib.parse.unquote(href.rsplit("/", 1)[-1])
            (home / f"ecode-{guid}-att{n}.name").write_text(name)
    return found


def survey(cache, towns):
    lines = ["# Zoning ordinances from eCode360", "",
             "Written by `scripts/towns/fetch_ecode.py`. Copies for reading, not yet cited sources. Counts are matches over the chapter text and its attachments: a rough guide to what each ordinance contains, not a reading of it.", ""]
    head = ["town", "chapters", "words", "attachments (scans)"] + list(MARKERS)
    lines += ["| " + " | ".join(head) + " |", "|" + " --- |" * len(head)]
    for town in towns:
        home = cache / sl.slug(town) / "ordinance"
        texts = sorted(home.glob("ecode-*.txt")) if home.exists() else []
        body = "\n".join(t.read_text(errors="replace") for t in texts)
        chaps = [t for t in texts if "-att" not in t.name]
        atts = [t for t in texts if "-att" in t.name]
        scans = sum(1 for t in atts if len(t.read_text(errors="replace").split()) < 40)
        row = [town + (" (not the official copy)" if town in NOT_OFFICIAL else ""), str(len(chaps)), f"{len(body.split()):,}", f"{len(atts)} ({scans})"]
        row += [str(len(re.findall(rx, body, re.I))) for rx in MARKERS.values()]
        lines.append("| " + " | ".join(row) + " |")
    lines += ["", "## Attachments", ""]
    for town in towns:
        home = cache / sl.slug(town) / "ordinance"
        names = sorted(home.glob("ecode-*.name")) if home.exists() else []
        if names: lines += [f"- **{town}:** " + "; ".join(n.read_text().strip() for n in names)]
    (cache / "ECODE.md").write_text("\n".join(lines) + "\n")


def main(args):
    cache = pathlib.Path(args[args.index("--cache") + 1]) if "--cache" in args else sl.CACHE
    towns = [a for a in args if a in ECODE] or list(ECODE)
    bad = [a for a in args if a not in ECODE and not a.startswith("--") and a != str(cache)]
    if bad: sys.exit(f"Not on eCode360 (or misspelled): {', '.join(bad)}")
    for town in towns:
        try:
            found = fetch_town(town, cache)
            print(f"{town}: {len(found)} chapters: " + "; ".join(t for t, _ in found))
        except Exception as e:  # one town failing shouldn't stop the rest
            print(f"{town}: FAILED ({e})")
    survey(cache, list(ECODE))
    print(f"Survey: {cache / 'ECODE.md'}")


if __name__ == "__main__":
    main(sys.argv[1:])
