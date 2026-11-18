#!/usr/bin/env python3
"""Put every file in the local source folder where it belongs, and write an index of what is there.

usage: organize_sources.py [CACHE_DIR]        (default: .sources)

- A file named for a source id (pregs.pdf) is moved to <town>/<kind>/.
- A file saved from a browser under the name in its URL (26.07.22-Official-Zoning-Ordinance.pdf), anywhere
  in the folder, is recognised, renamed to its source id and moved. So: save the file, run this.
- A PDF or web page with no text beside it is converted.
- Anything else is left where it is and listed as unrecognised.
- INDEX.md lists every source by town and kind: in hand, scanned, or missing, and whether a script can fetch it.
"""
import pathlib, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import sourcelib as sl


def main(cache):
    cache = pathlib.Path(cache); cache.mkdir(exist_ok=True)
    srcs = sl.sources(); by_id = {s["id"]: s for s in srcs}; by_name = {s["basename"]: s for s in srcs if "." in s["basename"]}
    moved, strays = 0, []
    # Whole ordinances fetched for reading (fetch_ecode.py) sit in <town>/ordinance/ and are not sources yet (ARD D34).
    # An ordinance saved by hand (a PDF or a page from Municode, ClerksHQ, a town site) gets its text beside it.
    for f in sorted(cache.glob("*/ordinance/*")):
        if f.suffix.lower() in (".pdf", ".html", ".htm") and not f.with_suffix(".txt").exists() and not f.name.startswith("ecode-"): sl.to_text(f)
    whole = sorted(p for p in cache.glob("*/ordinance/*.txt") if "-att" not in p.name)
    for f in sorted(p for p in cache.rglob("*") if p.is_file() and p.name not in ("INDEX.md", "ECODE.md") and p.parent.name not in ("ordinance", "openmeetings")):
        s = by_id.get(f.stem) or by_name.get(f.name)
        if not s: strays.append(f.relative_to(cache)); continue
        dest = sl.home(cache, s) / f"{s['id']}{f.suffix}"
        if f != dest:
            dest.parent.mkdir(parents=True, exist_ok=True); f.rename(dest); moved += 1
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
    if whole: lines += ["## Whole ordinances, for reading", "", "Copies from eCode360, not yet cited. The survey is in ECODE.md.", "", *[f"- `{p.relative_to(cache)}`: {p.read_text(errors='replace').splitlines()[0]}" for p in whole], ""]
    if strays: lines += ["## Unrecognised files", "", *[f"- `{p}`" for p in strays], ""]
    (cache / "INDEX.md").write_text("\n".join(lines))
    print(f"{have} of {len(srcs)} sources in hand. {moved} files moved, {made} converted to text. Index: {cache / 'INDEX.md'}")
    if strays: print("Unrecognised, left in place:\n  " + "\n  ".join(map(str, strays)))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else sl.CACHE)
