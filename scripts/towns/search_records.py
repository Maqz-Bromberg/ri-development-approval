"""Search a town's board records on the state Open Meetings site for housing, so that "read, and none found" can be
claimed with what was searched (ARD D63, chunk 6).

    python3 scripts/towns/search_records.py Foster Exeter ...      writes lib/data/towns/records-searched.json (merged)

For each town's planning and zoning boards: every past meeting listed since 2023 (the site lists a body's latest hundred),
its latest agenda, and its minutes where the agenda mentions housing or has no text. A hit is a line naming homes:
a number of units, multi-family or two-family, a comprehensive permit, low- and moderate-income housing, a residential
compound or cluster, an accessory dwelling unit or adaptive reuse. Hits are kept with the meeting, for a person to read;
the script does not decide what is a project. Pages and files are saved in .sources/<town>/openmeetings/, and the hits
in .sources/<town>/openmeetings/housing-hits.json, not in the repository: minutes name residents (principle 7). The
repository's file keeps what was searched and the count of hits; lib/data/searched.ts keeps what a person read in them.
"""
import datetime, json, pathlib, re, subprocess, sys, urllib.parse

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import sourcelib as sl
import fetch_bodies as fb

SINCE = "20230101"
HOUSING = re.compile(r"\b\d+\s*(?:-|\s)?(?:new\s+)?(?:residential\s+|dwelling\s+|housing\s+|apartment\s+|condominium\s+|duplex\s+)?(?:units?|apartments|dwellings|condominiums|townhouses|townhomes)\b"
                     r"|multi-?\s?family|two-?\s?family|duplex|comprehensive permit|low[- ]and[- ]moderate|affordable housing|LMI\b|residential compound|cluster development|accessory dwelling|adaptive reuse|mixed[- ]use", re.I)
OUT = sl.ROOT / "lib/data/towns/records-searched.json"


def text_of(pdf):
    if not pdf.read_bytes().startswith(b"%PDF"): return ""
    return subprocess.run(["pdftotext", "-layout", str(pdf), "-"], capture_output=True, text=True).stdout


def fetch(folder, kind, path):
    pdf = folder / (kind + "-" + re.sub(r"\W+", "-", path).strip("-") + ".pdf")
    if not pdf.exists(): pdf.write_bytes(fb.get(f"{fb.BASE}/Common/DownloadMeetingFiles?FilePath={urllib.parse.quote(path)}", raw=True))
    return text_of(pdf)


def hits(text):
    lines = [re.sub(r"\s+", " ", l).strip() for l in text.splitlines()]
    return [l[:240] for l in lines if HOUSING.search(l)]


def body(town, b, folder):
    page = fb.cached(folder / f"body-{b['id']}.html", lambda: fb.get(f"{fb.BASE}/OpenMeetingsPublic/OpenMeetingDashboard?subtopmenuId=201&EntityID={b['id']}"))
    rows = sorted({(d, mid) for mid, d, _ in fb.rows(fb.section(page, "Past Meetings")) if d >= SINCE})
    out = {"id": b["id"], "name": b["name"], "role": b["role"], "from": fb.iso(rows[0][0]) if rows else None, "to": fb.iso(rows[-1][0]) if rows else None,
           "meetings": len(rows), "agendas": 0, "scans": 0, "noFiles": 0, "hits": []}
    for d, mid in rows:
        m = fb.meeting(mid, folder)
        a = fetch(folder, "agenda", m["agenda"][0]) if m["agenda"] else ""
        if m["agenda"]: out["agendas"] += 1
        scan = bool(m["agenda"]) and len(re.findall(r"[A-Za-z]{3,}", a)) < 40
        out["scans"] += scan
        found = hits(a)
        mins = []
        if m["minutes"] and (found or scan or not m["agenda"]):
            mt = fetch(folder, "minutes", m["minutes"][0])
            mins = hits(mt)
            if len(re.findall(r"[A-Za-z]{3,}", mt)) < 40: out["scans"] += 1
        if not m["agenda"] and not m["minutes"]: out["noFiles"] += 1
        if found or mins: out["hits"].append({"date": fb.iso(d), "meeting": mid, "agenda": found[:12], "minutes": mins[:12]})
        print(f"  {town} {b['role']} {fb.iso(d)} {len(found)}+{len(mins)}", flush=True)
    return out


def main():
    bodies = json.loads((sl.ROOT / "lib/data/bodies.json").read_text())["towns"]
    for town in sys.argv[1:]:
        folder = sl.CACHE / sl.slug(town) / "openmeetings"; folder.mkdir(parents=True, exist_ok=True)
        bs = [b for b in bodies[town]["bodies"] if b["role"] in ("planning", "zoning")]
        found = [body(town, b, folder) for b in bs]
        (folder / "housing-hits.json").write_text(json.dumps({b["name"]: b["hits"] for b in found}, indent=1, ensure_ascii=False) + "\n")
        # Read again before writing: runs for different towns may share the file.
        data = json.loads(OUT.read_text()) if OUT.exists() else {}
        data[town] = {"read": datetime.date.today().isoformat(), "bodies": [{**{k: v for k, v in b.items() if k != "hits"}, "hits": len(b["hits"])} for b in found]}
        OUT.write_text(json.dumps(dict(sorted(data.items())), indent=1, ensure_ascii=False) + "\n")
    print("written", OUT.relative_to(sl.ROOT))


if __name__ == "__main__":
    main()
