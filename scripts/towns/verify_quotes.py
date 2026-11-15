#!/usr/bin/env python3
"""Check every stored quote in a town's data files against the text of the document it cites.

A quote is any `q: "..."` in a TypeScript data file. Its source is the `src: "id"` (or the first id of
`src: ["id", ...]`) written before it on the same line, or failing that the last one on the line above.
The source text is <id>.txt anywhere under the local source folder (see scripts/sourcelib.py).

usage: verify_quotes.py [CACHE_DIR] [FILE ...] [--allow-missing]      (CACHE_DIR defaults to .sources)
  With no FILE, checks lib/data/towns/*/*.ts. Pass lib/data/trees.ts or lib/engine.ts to check those too.
exit 1: a quote was not found in its source, or has no source on its line.
exit 2: every quote that could be checked passed, but some sources are not in the cache (0 with --allow-missing).
"""
import pathlib, re, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import sourcelib as sl

ROOT = pathlib.Path(__file__).resolve().parents[2]
QUOTE = re.compile(r'\bq: "((?:[^"\\]|\\.)*)"')
SRC = re.compile(r'\bsrc: (?:"(\w+)"|\["(\w+)")')


def norm(s):
    for a, b in (("’", "'"), ("‘", "'"), ("“", '"'), ("”", '"'), ("\\\"", '"')):
        s = s.replace(a, b)
    s = re.sub(r"\[\d+:\d\d:\d\d\]", " ", s)  # time marks in machine transcripts
    return re.sub(r"\s+", " ", s).strip().lower()


def unnumbered(raw):
    """The text with a line number at the start of each line removed. Cumberland's regulations are printed that way."""
    return norm(re.sub(r"^[ \t]*\d{1,2}(?=[ \t]{2,}|$)", " ", raw, flags=re.M))


# Sources that are live data, not documents. A value quoted from one cannot be matched against a saved page.
LIVE = {"rizaLayer"}


def main(argv):
    allow = "--allow-missing" in argv
    args = [a for a in argv if not a.startswith("--")]
    cache = pathlib.Path(args.pop(0)) if args and pathlib.Path(args[0]).is_dir() else sl.CACHE
    files = [pathlib.Path(a) for a in args] or sorted((ROOT / "lib/data/towns").glob("*/*.ts"))
    known = set(re.findall(r"^\s*(\w+): \{ label:", (ROOT / "lib/data/sources.ts").read_text(), re.M))
    texts, bad, missing, ok, live = {}, [], {}, 0, 0
    for f in files:
        lines = f.read_text().split("\n")
        for n, line in enumerate(lines, 1):
            for m in QUOTE.finditer(line):
                where = f"{f.relative_to(ROOT) if f.is_absolute() else f}:{n}"
                srcs = [a or b for a, b in SRC.findall(line[: m.start()])] or [a or b for a, b in SRC.findall(lines[n - 2] if n > 1 else "")]
                if not srcs:
                    bad.append(f"{where}: quote with no src before it on its line or the line above: {m.group(1)[:50]!r}"); continue
                sid = srcs[-1]
                if sid not in known:
                    bad.append(f"{where}: unknown source {sid}"); continue
                if sid in LIVE:
                    live += 1; continue
                if sid not in texts:
                    t = sl.find(cache, sid)
                    raw = t.read_text(errors="replace") if t and t.stat().st_size > 200 else None
                    texts[sid] = (norm(raw), unnumbered(raw)) if raw else None
                if texts[sid] is None:
                    missing.setdefault(sid, []).append(where); continue
                if any(norm(m.group(1)) in t for t in texts[sid]): ok += 1
                else: bad.append(f"{where}: not found in {sid}: {m.group(1)[:70]!r}")
    print(f"{ok} quotes found word for word")
    if live: print(f"{live} are values from live data, not checked")
    if missing:
        print(f"{sum(map(len, missing.values()))} quotes not checked, source text not in the cache:")
        for sid, ws in sorted(missing.items()): print(f"  {sid}: {len(ws)} ({ws[0]}{' …' if len(ws) > 1 else ''})")
    if bad:
        print("FAILED:\n  " + "\n  ".join(bad)); sys.exit(1)
    if missing and not allow: sys.exit(2)


if __name__ == "__main__":
    main(sys.argv[1:])
