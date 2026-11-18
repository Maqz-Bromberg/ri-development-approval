"""Level 2 for every town: its land-use boards, from the state Open Meetings site (ARD D53, chunk 2).

    python3 scripts/towns/fetch_bodies.py              # every town; pages already saved are reused
    python3 scripts/towns/fetch_bodies.py Westerly     # one town
    python3 scripts/towns/fetch_bodies.py --refresh    # fetch every page again

For each town it asks the site's public-body search for the town's boards (planning, zoning, council, review,
historic, conservation), then reads each board's dashboard: meetings held, the next one posted, cancellations, and
when each set of minutes was filed. For the planning body it opens the latest minutes and says whether they have a
text layer or are a scan, which decides how far a town's minutes can be quoted (D7).

Raw pages are kept in .sources/<town>/openmeetings/ (not committed). The result is lib/data/bodies.json, which the
site reads. Nothing here is a reading of the minutes: it is where they are, how often, and in what form.
The site answers 429 to quick runs, so every request waits two seconds, and a 429 waits a minute and tries again.
"""
import datetime, html, json, pathlib, re, subprocess, sys, time, urllib.parse, urllib.request

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import sourcelib as sl

BASE = "https://opengov.sos.ri.gov"
UA = {"User-Agent": "ri-plan-approval/1.0 (public records)"}
OUT = sl.ROOT / "lib/data/bodies.json"
REFRESH = "--refresh" in sys.argv

# What each kind of board is called, and who sits on it (principle 1).
ROLES = [
    ("trc", r"\b(Technical Review|Development (Plan )?Review|Land Development Review)\b", "appointed"),
    ("planning", r"\b(Planning (Board|Commission)|Plan Commission)$", "appointed"),
    ("zoning", r"\bZoning Board\b(?!.*(Subcommittee|Ordinance))|\bBoard of (Zoning )?Review\b", "appointed"),
    ("council", r"\b(Town|City) Council( Meeting)?$", "elected"),
    ("design", r"\b(Design Review|Architectural Review)\b", "appointed"),
    ("historic", r"\bHistoric (District|Preservation) Commission\b", "appointed"),
    ("conservation", r"\bConservation Commission$", "appointed"),
    ("special", r"\bI-195 Redevelopment District Commission\b|\bCapital Center Commission\b", "state"),
]
QUERIES = ["Planning", "Plan Commission", "City Plan", "Zoning", "Town Council", "City Council", "Technical Review", "Development Review",
           "Design Review", "Architectural", "Historic", "Conservation"]
EXTRA = {"Providence": ["I-195 Redevelopment", "Capital Center"]}
# A town whose zoning board files under another name. "Board of Appeals" alone also names building-code boards elsewhere.
ALIAS = {"Pawtucket": {"Pawtucket Board of Appeals": ("zoning", "appointed")}}
# A search for a short name also finds bodies of the towns whose names contain it.
CONTAINS = {"Providence": ["North Providence", "East Providence"], "Warwick": ["West Warwick"], "Greenwich": [],
            "Smithfield": ["North Smithfield"], "Kingstown": [], "Newport": []}

last = [0.0]


def get(url, data=None, raw=False):
    for attempt in range(4):
        wait = 2 - (time.time() - last[0])
        if wait > 0: time.sleep(wait)
        req = urllib.request.Request(url, data=urllib.parse.urlencode(data).encode() if data else None, headers=UA)
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                last[0] = time.time()
                b = r.read()
                return b if raw else b.decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            last[0] = time.time()
            if e.code == 429:
                print("  429, waiting a minute", flush=True); time.sleep(60); continue
            raise
        except Exception as e:  # a dropped connection: try again after a pause
            last[0] = time.time(); print(f"  {e}, retrying", flush=True); time.sleep(10)
    raise RuntimeError(f"gave up on {url}")


def cached(path, fetch):
    if path.exists() and not REFRESH: return path.read_text()
    text = fetch()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)
    return text


def search(town, folder):
    found = {}
    for q in QUERIES + EXTRA.get(town, []):
        term = q if town in EXTRA and q in EXTRA[town] else f"{town} {q}"
        text = cached(folder / f"search-{sl.slug(q)}.json", lambda: get(f"{BASE}/OpenMeetingsPublic/SuggestSearchPublicPostingEntity/", {"value": term}))
        for x in json.loads(text or "[]"):
            found[x["uniqueID"]] = x["Description"].strip()
    for name in ALIAS.get(town, {}):
        text = cached(folder / f"search-{sl.slug(name)}.json", lambda: get(f"{BASE}/OpenMeetingsPublic/SuggestSearchPublicPostingEntity/", {"value": name}))
        for x in json.loads(text or "[]"):
            found[x["uniqueID"]] = x["Description"].strip()
    own = {}
    others = CONTAINS.get(town, [])
    for i, name in found.items():
        if any(o in name for o in others): continue
        if town not in name and not any(t in name for t in EXTRA.get(town, [])): continue
        # "Westerly ...", "Town of Westerly ...", "City of Providence ..."; not a state commission that names the town in passing
        if not re.match(rf"^(Town of |City of )?{re.escape(town)}\b", name) and not re.search(r"I-195|Capital Center", name): continue
        role = ALIAS.get(town, {}).get(name) or next(((r, k) for r, rx, k in ROLES if re.search(rx, name, re.I)), None)
        if role: own[i] = (name, *role)
    return own


def table(page, tid):
    m = re.search(rf'id="{tid}".*?</table>', page, re.S)
    return m.group(0) if m else ""


def dates(fragment, div="hdnDateSeq"):
    return [(int(mid), d[:8]) for mid, d in re.findall(rf"ViewMeetingDetails\((\d+)\)'?\)?[^<]*<div id='{div}'[^>]*>(\d{{14}})", fragment)]


def section(page, title):
    """The part of the dashboard under one heading, up to the next."""
    m = re.search(rf"{title}\s*</h2>(.*?)(<h2|$)", page, re.S)
    return m.group(1) if m else ""


def iso(d): return f"{d[:4]}-{d[4:6]}-{d[6:8]}"


def rows(fragment):
    """(meeting id, YYYYMMDD, time) for each row of a meetings table."""
    out = []
    for r in fragment.split("<tr")[1:]:
        m = re.search(r"ViewMeetingDetails\((\d+)\).*?hdnDateSeq'[^>]*>(\d{14})", r, re.S)
        t = re.search(r"<span>\s*(\d{1,2}:\d{2}\s*[AP]M)</span>", r)
        if m: out.append((int(m.group(1)), m.group(2)[:8], t.group(1).replace(" ", "") if t else None))
    return out


WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
NTH = {1: "first", 2: "second", 3: "third", 4: "fourth", 5: "fifth"}


def pattern(meetings):
    """The usual day and time of a board's meetings since 2025, said only where most meetings follow it."""
    recent = [(datetime.date.fromisoformat(iso(d)), t) for _, d, t in meetings if d >= "20250101" and d <= datetime.date.today().strftime("%Y%m%d")]
    if len(recent) < 4: return None
    days = [d for d, _ in recent]
    wd = max(set(x.weekday() for x in days), key=lambda w: sum(x.weekday() == w for x in days))
    on_wd = [x for x in days if x.weekday() == wd]
    nth = max(set((x.day - 1) // 7 + 1 for x in on_wd), key=lambda n: sum((x.day - 1) // 7 + 1 == n for x in on_wd))
    share_wd = len(on_wd) / len(days)
    share_nth = sum((x.day - 1) // 7 + 1 == nth for x in on_wd) / len(days)
    times = [t for _, t in recent if t]
    time_ = max(set(times), key=times.count) if times else None
    span = (max(days) - min(days)).days or 1
    per_year = round(len(days) / span * 365)
    if share_nth >= 0.6: text = f"usually the {NTH[nth]} {WEEKDAYS[wd]} of the month"
    elif share_wd >= 0.6: text = f"usually on a {WEEKDAYS[wd]}"
    else: text = "on no fixed day"
    return {"text": text, "time": time_ if time_ and times.count(time_) / len(times) >= 0.6 else None, "perYear": per_year, "count": len(days)}


def dashboard(eid, folder):
    page = cached(folder / f"body-{eid}.html", lambda: get(f"{BASE}/OpenMeetingsPublic/OpenMeetingDashboard?subtopmenuId=201&EntityID={eid}"))
    upcoming = sorted({iso(d) for _, d in dates(section(page, "Upcoming Meetings"))})
    past = dates(section(page, "Past Meetings"))
    cancelled = sorted({iso(d) for _, d in dates(table(page, "CancelledMeetingSummary"))})
    minutes = re.findall(r"ViewMeetingDetails\((\d+)\)'\)?><div id='hdnRecentMeetingDate'[^>]*>(\d{14})</div>.*?hdnRecentMinutesDate'[^>]*>(\d{14})", table(page, "RecentlyFiledMeetingMinutes"), re.S)
    return page, upcoming, past, cancelled, minutes


def meeting(mid, folder):
    page = cached(folder / f"meeting-{mid}.html", lambda: get(f"{BASE}/OpenMeetingsPublic/ViewMeetingDetailByID?MeetingID={mid}"))
    text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<script.*?</script>|<style.*?</style>", "", page, flags=re.S))))
    place = re.search(r"Address: (.*?) Filed on:", text)
    phone = re.search(r"Phone: (\(?\d{3}\)?[ -]?\d{3}-\d{4})", text)
    files = re.findall(r"DownloadMeetingFiles\('([^']+)'\)", page)
    return {"place": place.group(1).strip() if place else None, "phone": phone.group(1) if phone else None,
            "minutes": [f.replace("\\\\", "\\") for f in files if "\\Minutes\\" in f.replace("\\\\", "\\")],
            "agenda": [f.replace("\\\\", "\\") for f in files if "\\Notices\\" in f.replace("\\\\", "\\")]}


def text_layer(path, folder):
    """'text' when the PDF has words to quote, 'scan' when it is pictures of pages."""
    pdf = folder / ("minutes-" + re.sub(r"\W+", "-", path).strip("-") + ".pdf")
    if not pdf.exists() or REFRESH:
        pdf.write_bytes(get(f"{BASE}/Common/DownloadMeetingFiles?FilePath={urllib.parse.quote(path)}", raw=True))
    if not pdf.read_bytes().startswith(b"%PDF"): return "not a PDF"
    out = subprocess.run(["pdftotext", "-layout", str(pdf), "-"], capture_output=True, text=True).stdout
    pages = max(1, out.count("\f"))
    return "text" if len(re.findall(r"[A-Za-z]{3,}", out)) / pages > 40 else "scan"


def town_bodies(town):
    folder = sl.CACHE / sl.slug(town) / "openmeetings"
    bodies = []
    for eid, (name, role, kind) in sorted(search(town, folder).items()):
        page, upcoming, past, cancelled, minutes = dashboard(eid, folder)
        held = sorted({iso(d) for _, d in past})
        since = [d for d in held if d >= "2023-01-01"]
        # Only meetings since 2023: a town that files old minutes in bulk would otherwise show a lag of years.
        lags = sorted((datetime.date.fromisoformat(iso(f)) - datetime.date.fromisoformat(iso(m))).days for _, m, f in minutes if m >= "20230101")
        listed = rows(section(page, "Past Meetings"))
        b = {"id": eid, "name": name, "role": role, "kind": kind, "url": f"{BASE}/OpenMeetingsPublic/OpenMeetingDashboard?subtopmenuId=201&EntityID={eid}",
             "pattern": pattern(listed), "recent": [iso(d) for _, d, _ in listed[:6]],
             "meetings": len(held), "since2023": len(since), "first": held[0] if held else None, "last": held[-1] if held else None,
             "upcoming": upcoming, "cancelled": [d for d in cancelled if d >= "2025-01-01"],
             "minutesFiled": len(minutes), "minutesLagDays": lags[len(lags) // 2] if lags else None}
        bodies.append(b)
        print(f"  {eid} {name} [{role}] {len(held)} meetings, last {b['last']}, next {upcoming[:1]}, minutes {len(minutes)}", flush=True)
    # The planning body that meets: its latest meeting with minutes, and their form.
    plan = sorted((b for b in bodies if b["role"] == "planning"), key=lambda b: (b["since2023"], b["meetings"]), reverse=True)
    for b in plan[:1]:
        page = (folder / f"body-{b['id']}.html").read_text()
        filed = re.findall(r"ViewMeetingDetails\((\d+)\)'\)?><div id='hdnRecentMeetingDate'", table(page, "RecentlyFiledMeetingMinutes"))
        recent = [mid for mid, _ in dates(section(page, "Past Meetings"))][:1]
        for mid in (filed[:1] or recent):
            m = meeting(mid, folder)
            b["place"], b["phone"] = m["place"], m["phone"]
            if m["minutes"]: b["minutesForm"] = text_layer(m["minutes"][0], folder)
        b["primary"] = True
    for role in ("zoning", "council"):
        best = sorted((b for b in bodies if b["role"] == role), key=lambda b: (b["since2023"], b["meetings"]), reverse=True)
        if best: best[0]["primary"] = True
    return bodies


def main():
    names = [a for a in sys.argv[1:] if not a.startswith("--")] or sorted(sl.towns())
    data = json.loads(OUT.read_text()) if OUT.exists() else {"towns": {}}
    for town in names:
        print(town, flush=True)
        data["towns"][town] = {"read": datetime.date.today().isoformat(), "bodies": town_bodies(town)}
        data["source"] = f"{BASE}/OpenMeetings"
        data["towns"] = dict(sorted(data["towns"].items()))
        OUT.write_text(json.dumps(data, indent=1) + "\n")


if __name__ == "__main__":
    main()
