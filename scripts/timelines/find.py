#!/usr/bin/env python3
"""Search newly fetched agendas for each tracked project, and list multifamily items matching none.
Writes report.md into CACHE_DIR. It proposes nothing: a person reads the passages and writes events.
usage: find.py CACHE_DIR
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]


def main(cache):
    cache = pathlib.Path(cache)
    new = json.loads((cache / "new-agendas.json").read_text())
    hist = (ROOT / "lib/data/history.ts").read_text()
    projects = re.findall(r'name: "([^"]+)", addr: "([^"]+)", lot: "([^"]*)"', hist)
    out = ["# Timeline candidates", ""]
    if not new:
        out.append("No new Planning Board agendas since the last check.")
    for d in new:
        text = re.sub(r"\s+", " ", (cache / f"new-{d}.txt").read_text(errors="replace"))
        out.append(f"## Agenda {d}")
        matched = False
        for name, addr, lot in projects:
            keys = [k for k in (name, addr.split(" & ")[0], lot.split(" & ")[0]) if k]
            for k in keys:
                for m in re.finditer(re.escape(k), text, re.I):
                    out.append(f"- **{name}** (matched `{k}`): …{text[max(0, m.start()-150):m.end()+250]}…"); matched = True; break
                if matched: break
        for m in re.finditer(r"Project Type:\s*([^:]*(?:Major|Minor) Land Development[^P]{0,200}?)Project Name:\s*([^O]{0,80})", text):
            if not any(p[0].lower() in m.group(2).lower() for p in projects):
                out.append(f"- Untracked candidate: {m.group(2).strip()} ({m.group(1).strip()[:80]})")
        out.append("")
    (cache / "report.md").write_text("\n".join(out)); print("\n".join(out))


if __name__ == "__main__":
    main(sys.argv[1])
