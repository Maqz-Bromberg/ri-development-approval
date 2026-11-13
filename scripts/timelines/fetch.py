#!/usr/bin/env python3
"""Download the source documents each tracked event cites, plus any Planning Board
agendas dated after a project's `checked` date, into a cache directory (never committed).

usage: fetch.py CACHE_DIR
Fails loudly (exit 1) when a cited source cannot be fetched or is empty.
"""
import datetime as dt, json, pathlib, re, subprocess, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
UA = {"User-Agent": "ri-plan-approval-timelines/1.0 (public records)"}


def sources():
    text = (ROOT / "lib/data/sources.ts").read_text()
    return dict(re.findall(r'^\s*(\w+): \{ label: "(?:[^"\\]|\\.)*", url: "([^"]+)"', text, re.M))


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read()


def to_text(path: pathlib.Path):
    if path.suffix == ".pdf":
        subprocess.run(["pdftotext", "-layout", str(path), str(path.with_suffix(".txt"))], check=True)
    else:
        html = path.read_bytes().decode("utf-8", "replace")
        path.with_suffix(".txt").write_text(re.sub(r"<[^>]+>", " ", html))


def main(cache):
    cache = pathlib.Path(cache); cache.mkdir(parents=True, exist_ok=True)
    srcs, failed = sources(), []
    timelines = json.loads((ROOT / "lib/data/timelines.json").read_text())
    # Press reports are linked, not quoted, and many sites refuse automated clients, so they are not fetched.
    cited = {s for t in timelines.values() for e in t["events"] if e["kind"] != "reported" for s in e["src"]}
    for sid in sorted(cited):
        url = srcs.get(sid)
        if not url or "youtube" in url:
            continue  # videos need transcription; they are not text sources
        ext = ".pdf" if url.lower().endswith(".pdf") else ".html"
        out = cache / f"{sid}{ext}"
        try:
            out.write_bytes(get(url)); to_text(out)
            if out.with_suffix(".txt").stat().st_size < 200: raise ValueError("empty text")
        except Exception as e:  # noqa: BLE001
            failed.append(f"{sid}: {e}")
    # New agendas: ClerkBase names them {mon}{dd}_{yy}pbag.htm; the board meets on Thursdays.
    since = min(dt.date.fromisoformat(t["checked"]) for t in timelines.values())
    d = since + dt.timedelta(days=(3 - since.weekday()) % 7)
    new = []
    while d <= dt.date.today():
        name = f"{d.strftime('%b').lower()}{d.day:02d}_{d.strftime('%y')}pbag.htm"
        url = f"https://clerkshq.com/Content/Cumberland-RI/Planning/{d.year}/{name}"
        try:
            out = cache / f"new-{d.isoformat()}.html"; out.write_bytes(get(url)); to_text(out); new.append(d.isoformat())
        except urllib.error.HTTPError as e:
            if e.code != 404: failed.append(f"{url}: {e}")  # 404 = no meeting that Thursday
        d += dt.timedelta(days=7)
    (cache / "new-agendas.json").write_text(json.dumps(new))
    print(f"fetched {len(cited)} cited sources, {len(new)} new agendas")
    if failed:
        print("FAILED:\n  " + "\n  ".join(failed)); sys.exit(1)


if __name__ == "__main__":
    main(sys.argv[1])
