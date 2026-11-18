"""Every item on a board's agendas since a date, from the state Open Meetings site (ARD D53, chunk 0, step 1).

    python3 scripts/towns/list_agenda_items.py Providence 2767 2023-01-01

Reads the board's dashboard (saved by fetch_bodies.py, or fetched), opens each past meeting since the date, saves its
latest agenda and turns it to text, and lists every numbered item with a case number: the case, the address, the kind
of review it was heard under, the plat and lot, and any number of homes the description gives. Items are grouped by
case into projects, each with the meetings it was on.

Written to lib/data/towns/<town>/agenda.json, which the Records page lists, so a project not yet read into the
precedent shows as a named gap. Applicants are left out: the agendas name private people, and the site describes
people by role (principle 7). Agendas with no text layer are counted and named.
"""
import datetime, json, pathlib, re, subprocess, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import sourcelib as sl
import fetch_bodies as fb

UNITS = re.compile(r"(\d[\d,]*)\s+(?:new\s+)?(?:residential\s+|dwelling\s+|housing\s+|apartment\s+|condominium\s+)?(?:units|apartments|residences|dwellings|condominiums)\b", re.I)
CASE = re.compile(r"^\s*(\d+)\.\s+Case\s+no\.?\s*([0-9]{2}-[0-9]{2,3}[A-Z-]*)\s*[–—-]\s*(.+?)\s*$", re.I | re.M)


def items(text):
    """Numbered items with a case number, with the heading above each and the text up to the next item."""
    out = []
    marks = list(CASE.finditer(text))
    for k, m in enumerate(marks):
        end = marks[k + 1].start() if k + 1 < len(marks) else len(text)
        body = text[m.end():end]
        before = text[(marks[k - 1].end() if k else 0):m.start()]
        heads = [l.strip() for l in before.splitlines() if l.strip() and l.strip().upper() == l.strip() and re.search(r"[A-Z]{4}", l)]
        heading = " · ".join(h for h in heads[-2:] if not h.startswith(("IMPORTANT", "OPENING SESSION")))
        desc = re.split(r"\n\s*(?:[A-Z][A-Z ,–-]{6,})\n|\n\s*IMPORTANT INFORMATION", body)[0]
        desc = re.sub(r"\s+", " ", re.sub(r"^\s*Applicants?:.*$", "", desc, flags=re.M)).strip()
        ap = re.findall(r"\((AP [^)]*)\)", desc)
        lot, area = (ap[-1], None) if ap else (None, None)
        if lot and "," in lot and not re.search(r"\d", lot.rsplit(",", 1)[1]): lot, area = [x.strip() for x in lot.rsplit(",", 1)]
        units = [int(u.replace(",", "")) for u in UNITS.findall(desc)]
        # Self-storage "units" are not homes.
        if re.search(r"storage", desc, re.I) and not re.search(r"residential|dwelling|apartment|housing|residence", desc, re.I): units = []
        out.append({"case": m.group(2).upper(), "address": m.group(3).strip(), "heading": heading.title(), "lot": lot, "area": area,
                    "units": max(units) if units else None, "what": desc[:400]})
    return out


def main():
    town, eid, since = sys.argv[1], int(sys.argv[2]), sys.argv[3].replace("-", "")
    folder = sl.CACHE / sl.slug(town) / "openmeetings"
    page = fb.cached(folder / f"body-{eid}.html", lambda: fb.get(f"{fb.BASE}/OpenMeetingsPublic/OpenMeetingDashboard?subtopmenuId=201&EntityID={eid}"))
    meetings = sorted({(d, mid) for mid, d, _ in fb.rows(fb.section(page, "Past Meetings")) if d >= since})
    projects, scans, none = {}, [], []
    for d, mid in meetings:
        m = fb.meeting(mid, folder)
        if not m["agenda"]: none.append(fb.iso(d)); continue
        path = m["agenda"][0]  # the site lists the latest filing first
        pdf = folder / ("agenda-" + re.sub(r"\W+", "-", path).strip("-") + ".pdf")
        if not pdf.exists():
            pdf.write_bytes(fb.get(f"{fb.BASE}/Common/DownloadMeetingFiles?FilePath={fb.urllib.parse.quote(path)}", raw=True))
        text = subprocess.run(["pdftotext", "-layout", str(pdf), "-"], capture_output=True, text=True).stdout if pdf.read_bytes().startswith(b"%PDF") else ""
        found = items(text)
        if not found and len(re.findall(r"[A-Za-z]{3,}", text)) < 60: scans.append(fb.iso(d))
        for it in found:
            p = projects.setdefault(it["case"], {"case": it["case"], "address": it["address"], "lot": it["lot"], "area": it["area"], "units": it["units"], "meetings": []})
            p["units"] = max(filter(None, [p["units"], it["units"]]), default=None)
            p["lot"] = p["lot"] or it["lot"]; p["area"] = p["area"] or it["area"]
            p["meetings"].append({"date": fb.iso(d), "heading": it["heading"], "what": it["what"], "meeting": mid})
        print(f"{fb.iso(d)} {len(found)} items", flush=True)
    out = {"town": town, "body": eid, "since": sl and f"{since[:4]}-{since[4:6]}-{since[6:]}", "read": datetime.date.today().isoformat(),
           "source": f"{fb.BASE}/OpenMeetingsPublic/OpenMeetingDashboard?subtopmenuId=201&EntityID={eid}",
           "meetings": len(meetings), "scanned": scans, "noAgenda": none,
           "projects": sorted(projects.values(), key=lambda p: (p["meetings"][0]["date"], p["case"]))}
    dest = sl.ROOT / "lib/data/towns" / sl.slug(town) / "agenda.json"
    dest.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    print(f"{len(projects)} cases on {len(meetings)} agendas; {len(scans)} agendas without text; written to {dest.relative_to(sl.ROOT)}")


if __name__ == "__main__":
    main()
