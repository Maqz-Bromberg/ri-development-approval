#!/usr/bin/env python3
"""Download the documents a town's data cites into CACHE_DIR as <source id>.pdf|.html plus <source id>.txt.

usage: fetch_sources.py CACHE_DIR PREFIX      (PREFIX: the town's source-id prefix in lib/data/sources.ts, e.g. p)

Some hosts refuse scripted requests. Those are listed at the end with their URLs, to be saved by hand
into CACHE_DIR under the id shown. A file already in the cache is converted, not fetched again.
It also flags any PDF whose text comes out empty: a scanned document that needs text recognition
before a quote can be checked against it.
exit 1 when a fetch fails for a reason other than a refusal.
"""
import pathlib, re, subprocess, sys, time, urllib.error, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
UA = {"User-Agent": "ri-plan-approval/1.0 (public records)"}


def to_text(path):
    if path.suffix == ".pdf":
        subprocess.run(["pdftotext", "-layout", str(path), str(path.with_suffix(".txt"))], check=True)
    else:
        path.with_suffix(".txt").write_text(re.sub(r"<[^>]+>", " ", path.read_bytes().decode("utf-8", "replace")))
    return path.with_suffix(".txt").stat().st_size


def main(cache, prefix):
    cache = pathlib.Path(cache); cache.mkdir(parents=True, exist_ok=True)
    srcs = re.findall(r'^\s*(\w+): \{ label: "(?:[^"\\]|\\.)*", url: "([^"]+)"', (ROOT / "lib/data/sources.ts").read_text(), re.M)
    refused, scanned, failed, got = [], [], [], 0
    for sid, url in srcs:
        if not sid.startswith(prefix) or "youtube" in url: continue
        ext = ".pdf" if ".pdf" in url.lower() else ".html"
        out = cache / f"{sid}{ext}"
        if not out.exists():
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r: out.write_bytes(r.read())
                time.sleep(2)  # the Open Meetings site answers 429 to quick runs of requests
            except urllib.error.HTTPError as e:
                (refused if e.code in (401, 403) else failed).append(f"{sid}  {url}  ({e.code})"); continue
            except Exception as e:  # noqa: BLE001
                failed.append(f"{sid}  {url}  ({e})"); continue
        got += 1
        if to_text(out) < 200 and ext == ".pdf": scanned.append(sid)
    print(f"{got} sources in the cache")
    if scanned: print("Scanned, no text layer (quotes from these cannot be matched):\n  " + "\n  ".join(scanned))
    if refused: print("Refused a scripted request. Save each by hand into the cache under its id:\n  " + "\n  ".join(refused))
    if failed:
        print("FAILED:\n  " + "\n  ".join(failed)); sys.exit(1)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
