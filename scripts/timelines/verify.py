#!/usr/bin/env python3
"""Check lib/data/timelines.json against the fetched documents.

- every date parses (YYYY-MM-DD or YYYY-MM);
- every "decided" event has a quote, and every quote appears verbatim (whitespace-normalised)
  in the text of one of the sources it cites;
- every cited source id exists in sources.ts;
- parties use only the allowed roles (business and professional roles; no residents).
usage: verify.py CACHE_DIR [--offline]   (--offline skips the quote check when nothing was fetched)
"""
import datetime as dt, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
ROLES = {"applicant", "owner", "engineer", "attorney", "architect", "builder"}
norm = lambda s: re.sub(r"\s+", " ", s.replace("’", "'").replace("“", '"').replace("”", '"')).strip().lower()


def main(cache, offline):
    srcs = set(re.findall(r"^\s*(\w+): \{ label:", (ROOT / "lib/data/sources.ts").read_text(), re.M))
    errors = []
    for name, t in json.loads((ROOT / "lib/data/timelines.json").read_text()).items():
        for e in t["events"]:
            where = f"{name} {e['date']}"
            try:
                dt.date.fromisoformat(e["date"] if len(e["date"]) == 10 else e["date"] + "-01")
            except ValueError:
                errors.append(f"{where}: bad date")
            for s in e["src"]:
                if s not in srcs: errors.append(f"{where}: unknown source {s}")
            if e["kind"] == "decided" and not e.get("quote"):
                errors.append(f"{where}: decided without a quote")
            if e.get("quote") and not offline:
                found = False
                for s in e["src"]:
                    f = pathlib.Path(cache) / f"{s}.txt"
                    if f.exists() and norm(e["quote"]) in norm(f.read_text(errors="replace")): found = True
                if not found: errors.append(f"{where}: quote not found in {', '.join(e['src'])}: {e['quote'][:60]!r}")
        for p in t.get("parties", []):
            if p["role"] not in ROLES: errors.append(f"{name}: party role {p['role']}")
    if errors:
        print("\n".join(errors)); sys.exit(1)
    print("timelines.json verified")


if __name__ == "__main__":
    main(sys.argv[1], "--offline" in sys.argv)
