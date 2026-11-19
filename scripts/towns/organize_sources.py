#!/usr/bin/env python3
"""Put every file in the local source folder where it belongs, and write an index of what is there.

usage: organize_sources.py [CACHE_DIR]        (default: .sources)

- A file named for a source id (pregs.pdf) is moved to <town>/<kind>/.
- A file saved from a browser under the name in its URL (26.07.22-Official-Zoning-Ordinance.pdf), anywhere
  in the folder, is recognised, renamed to its source id and moved. So: save the file, run this.
- A whole ordinance saved by hand, loose in the folder, whose file name names a town and says zoning, ordinance or code
  ("Bristol, RI Code of Ordinances.pdf", "FOSTER_ZONING.docx"), is moved to <town>/ordinance/ (ARD D34). A saved page's
  folder of images and scripts goes with it.
- A PDF, web page or Word file with no text beside it is converted.
- Anything else is left where it is and listed as unrecognised.
- INDEX.md lists every source by town and kind: in hand, scanned, or missing, and whether a script can fetch it.
"""
import re, pathlib, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import sourcelib as sl


def norm_url(u):
    """An address without its scheme, www, trailing slash or query, for matching a saved page to its source."""
    return re.sub(r"^https?://(www\.)?", "", (u or "").split("#")[0].split("?")[0]).rstrip("/").lower()


def saved_url(f):
    """The address a browser wrote into a page it saved: the canonical link, og:url, or Chrome's "saved from" comment."""
    head = f.read_bytes()[:400_000].decode("utf-8", "replace")
    for rx in (r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)', r'<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\']canonical',
               r'<meta[^>]+property=["\']og:url["\'][^>]+content=["\']([^"\']+)', r'<!-- saved from url=\(\d+\)(\S+) -->'):
        m = re.search(rx, head, re.I)
        if m: return norm_url(m.group(1))
    return None


ORDINANCE = re.compile(r"zoning|ordinance|\bord\b|code", re.I)
NOT_ORDINANCE = re.compile(r"form|application|checklist|map|minutes|agenda|schedule|staff.report", re.I)


def ordinance_town(f, names):
    """The town a loose ordinance belongs to, from its file name. None when the name names no town or is not an ordinance."""
    name = re.sub(r"[_\s]+", " ", f.stem)
    if not ORDINANCE.search(name) or NOT_ORDINANCE.search(name): return None
    return next((sl.slug(n) for n in names if re.search(rf"\b{re.escape(n)}\b", name, re.I)), None)


def first_line(p):
    """The first line of words in a text file, cut short: what the index says a whole ordinance is."""
    line = next((l for l in p.read_text(errors="replace").splitlines() if len(l.split()) > 1), "")
    line = " ".join(line.replace("\ufeff", "").split())
    return line[:110] + ("…" if len(line) > 110 else "")


def move(f, dest):
    """Move a file, and the folder of assets a browser saves beside a page ("X_files" beside "X.html")."""
    dest.parent.mkdir(parents=True, exist_ok=True); f.rename(dest)
    assets = f.with_name(f.stem + "_files")
    if f.suffix.lower() in (".html", ".htm") and assets.is_dir(): assets.rename(dest.with_name(dest.stem + "_files"))


def main(cache):
    cache = pathlib.Path(cache); cache.mkdir(exist_ok=True)
    srcs = sl.sources(); by_id = {s["id"]: s for s in srcs}; by_name = {s["basename"]: s for s in srcs if "." in s["basename"]}
    moved, strays = 0, []
    names = sl.towns()
    for f in sorted(p for p in cache.iterdir() if p.is_file() and p.suffix.lower() in (".pdf", ".html", ".htm", ".docx")):
        town = ordinance_town(f, names)
        if town and not (by_name.get(f.name) or by_id.get(f.stem)): move(f, cache / town / "ordinance" / f.name); moved += 1
    # Whole ordinances fetched for reading (fetch_ecode.py) sit in <town>/ordinance/ and are not sources yet (ARD D34).
    # An ordinance saved by hand (a PDF or a page from Municode, ClerksHQ, a town site) gets its text beside it.
    for f in sorted(cache.glob("*/ordinance/*")):
        if f.suffix.lower() in (".pdf", ".html", ".htm", ".docx") and not f.with_suffix(".txt").exists() and not f.name.startswith("ecode-"): sl.to_text(f)
    whole = sorted(p for p in cache.glob("*/ordinance/*.txt") if "-att" not in p.name)
    by_url = {norm_url(s["url"]): s for s in srcs}
    for f in sorted(p for p in cache.rglob("*") if p.is_file() and p.name not in ("INDEX.md", "ECODE.md", "engine-snapshot.json")
                    and p.parent.name not in ("ordinance", "openmeetings") and not any(x.name.endswith("_files") for x in p.parents)):
        s = by_id.get(f.stem) or by_name.get(f.name) or (by_url.get(saved_url(f)) if f.suffix.lower() in (".html", ".htm") else None)
        if not s: strays.append(f.relative_to(cache)); continue
        dest = sl.home(cache, s) / f"{s['id']}{f.suffix}"
        if f != dest:
            move(f, dest); moved += 1
    for d in sorted((p for p in cache.rglob("*") if p.is_dir()), reverse=True):
        if not any(d.iterdir()): d.rmdir()
    made = 0
    for s in srcs:
        raw = sl.find(cache, s["id"], s["ext"])
        if raw and s["ext"] != ".txt" and not sl.find(cache, s["id"]): sl.to_text(raw); made += 1

    lines = ["# Local sources", "", "Written by `scripts/towns/organize_sources.py`. Do not edit: run it again.", "",
             "`text` = words of text in hand. `scan` = the file is here but has no text layer. `missing` = not fetched yet.", ""]
    have = 0
    for town in sorted({s["town"] for s in srcs}, key=lambda t: (t != "state", t)):
        lines += [f"## {town}", ""]
        for kind in sl.KINDS:
            rows = [s for s in srcs if s["town"] == town and s["kind"] == kind]
            if not rows: continue
            lines += [f"### {kind}", "", "| id | state | reach | document |", "| --- | --- | --- | --- |"]
            for s in rows:
                txt, raw = sl.find(cache, s["id"]), sl.find(cache, s["id"], s["ext"])
                words = len(txt.read_text(errors="replace").split()) if txt else 0
                state = f"{words:,} words" if words > 40 else "scan" if raw else "missing"
                have += state != "missing"
                reach = "captions, by script" if s["video"] else "by hand" if s["by_hand"] else "script"
                lines.append(f"| `{s['id']}` | {state} | {reach} | [{s['label']}]({s['url']}) |")
            lines.append("")
    if whole: lines += ["## Whole ordinances, for reading", "", "Copies for reading, not yet cited: from eCode360 by script (surveyed in ECODE.md), and from ClerksHQ, Municode, American Legal and town sites by script or by hand.", "", *[f"- `{p.relative_to(cache)}`: {first_line(p)}" for p in whole], ""]
    if strays: lines += ["## In hand, not yet cited", "", "Saved, and not a source in `lib/data/sources.ts` yet: registered when read into the data.", "", *[f"- `{p}`" for p in strays], ""]
    (cache / "INDEX.md").write_text("\n".join(lines))
    print(f"{have} of {len(srcs)} sources in hand. {moved} files moved, {made} converted to text. Index: {cache / 'INDEX.md'}")
    if strays: print("Unrecognised, left in place:\n  " + "\n  ".join(map(str, strays)))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else sl.CACHE)
