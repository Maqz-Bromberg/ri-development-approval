#!/usr/bin/env python3
"""Download the documents a town's data cites into the local source folder, filed as <town>/<kind>/<source id>.

usage: fetch_sources.py TOWN [CACHE_DIR]      (TOWN: a municipality or "state"; CACHE_DIR defaults to .sources)

A file already in the folder is not fetched again. Some hosts refuse scripted requests: those sources are listed
at the end with their URLs. Save each from a browser anywhere in the folder, under any name the browser gives it,
and run organize_sources.py, which recognises and files it.
Recordings are left to fetch_captions.py. It also flags any PDF whose text comes out empty: a scan.
exit 1 when a fetch fails for a reason other than a refusal.
"""
import pathlib, sys, time, urllib.error, urllib.request

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import sourcelib as sl

UA = {"User-Agent": "ri-plan-approval/1.0 (public records)"}


def main(town, cache):
    cache = pathlib.Path(cache)
    by_hand, scanned, failed, got = [], [], [], 0
    for s in sl.sources():
        if s["town"] != sl.slug(town) or s["video"]: continue
        raw = sl.find(cache, s["id"], s["ext"])
        if not raw:
            if s["by_hand"]: by_hand.append(f"{s['id']}  {s['url']}"); continue
            raw = sl.home(cache, s) / f"{s['id']}{s['ext']}"; raw.parent.mkdir(parents=True, exist_ok=True)
            try:
                with urllib.request.urlopen(urllib.request.Request(s["url"], headers=UA), timeout=60) as r: raw.write_bytes(r.read())
                time.sleep(2)  # the Open Meetings site answers 429 to quick runs of requests
            except urllib.error.HTTPError as e:
                (by_hand if e.code in (401, 403) else failed).append(f"{s['id']}  {s['url']}  ({e.code})"); continue
            except Exception as e:  # noqa: BLE001
                failed.append(f"{s['id']}  {s['url']}  ({e})"); continue
        got += 1
        if sl.to_text(raw) < 200 and s["ext"] == ".pdf": scanned.append(s["id"])
    print(f"{got} {town} sources in hand")
    if scanned: print("Scanned, no text layer (quotes from these cannot be matched):\n  " + "\n  ".join(scanned))
    if by_hand: print("Not fetched: the host refuses scripts. Save each from a browser into the folder, then run organize_sources.py:\n  " + "\n  ".join(by_hand))
    if failed:
        print("FAILED:\n  " + "\n  ".join(failed)); sys.exit(1)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else sl.CACHE)
