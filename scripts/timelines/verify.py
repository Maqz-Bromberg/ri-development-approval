#!/usr/bin/env python3
"""Check lib/data/timelines.json and every lib/data/towns/*/timelines.json against the fetched documents.

- every date parses (YYYY-MM-DD or YYYY-MM);
- every "decided" event has a quote, and every quote appears verbatim (whitespace-normalised)
  in the text of one of the sources it cites;
- every cited source id exists in sources.ts;
- an event marked "scan" was read by eye from a scanned page with no text layer: its quote is required but
  cannot be matched, so it is counted and reported, never passed silently;
- a decision is expected in the minutes. One that rests only on a recording's machine captions must say why,
  in "gap" (the minutes are missing, scanned or silent);
- parties use only the allowed roles (business and professional roles; no residents).
usage: verify.py CACHE_DIR [--offline]   (--offline skips the quote check when nothing was fetched)
"""
import datetime as dt, json, pathlib, re, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import sourcelib as sl

ROOT = pathlib.Path(__file__).resolve().parents[2]
ROLES = {"applicant", "owner", "engineer", "attorney", "architect", "builder"}
norm = lambda s: re.sub(r"\s+", " ", re.sub(r"\[\d+:\d\d:\d\d\]", " ", s).replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')).strip().lower()


def main(cache, offline):
    srcs = set(re.findall(r"^\s*(\w+): \{ label:", (ROOT / "lib/data/sources.ts").read_text(), re.M))
    recordings = {x["id"] for x in sl.sources() if x["video"]}
    errors, scans = [], []
    files = [ROOT / "lib/data/timelines.json", *sorted((ROOT / "lib/data/towns").glob("*/timelines.json"))]
    timelines, strict = {}, set()
    for f in files:
        for k, v in json.loads(f.read_text()).items():
            timelines[k] = v
            if f == files[0]: strict.add(k)  # the monthly action fetches these sources, so a missing text is a failure
    unchecked = []
    for name, t in timelines.items():
        for e in t["events"]:
            where = f"{name} {e['date']}"
            try:
                dt.date.fromisoformat(e["date"] if len(e["date"]) == 10 else e["date"] + "-01")
            except ValueError:
                errors.append(f"{where}: bad date")
            for s in e["src"]:
                if s not in srcs: errors.append(f"{where}: unknown source {s}")
            if e.get("unverified") and e.get("quote"):
                errors.append(f"{where}: marked unverified but has a quote; remove the flag if the quote was checked")
            if e["kind"] == "decided" and e["src"] and all(x in recordings for x in e["src"]) and not e.get("gap"):
                errors.append(f"{where}: a decision resting only on a recording needs \"gap\": why the minutes do not carry it")
            if e["kind"] == "decided" and not e.get("quote"):
                errors.append(f"{where}: decided without a quote")
            if e.get("scan"):
                if not e.get("quote"): errors.append(f"{where}: scanned source with no transcribed quote")
                scans.append(where); continue
            if e.get("quote") and not offline:
                found = False
                have = [f for f in (sl.find(cache, s) for s in e["src"]) if f]  # by id, anywhere under the folder
                # A town's sources may need fetching by hand (scripts/towns/README.md). With none present, say so; don't fail or pass.
                if not have and name not in strict:
                    unchecked.append(where); continue
                for f in have:
                    if norm(e["quote"]) in norm(f.read_text(errors="replace")): found = True
                if not found: errors.append(f"{where}: quote not found in {', '.join(e['src'])}: {e['quote'][:60]!r}")
        for p in t.get("parties", []):
            if p["role"] not in ROLES: errors.append(f"{name}: party role {p['role']}")
    if errors:
        print("\n".join(errors)); sys.exit(1)
    print(f"timelines verified: {len(timelines)} projects in {len(files)} files")
    if unchecked: print(f"{len(unchecked)} quotes not checked, source text not in the cache: " + "; ".join(unchecked))
    if scans: print(f"{len(scans)} events rest on scanned pages read by eye, not matched: " + "; ".join(scans))


if __name__ == "__main__":
    main(sys.argv[1], "--offline" in sys.argv)
