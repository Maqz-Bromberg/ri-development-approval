#!/usr/bin/env python3
"""Fetch YouTube's automatic captions for the meeting recordings a town's data cites, as text.

usage: fetch_captions.py TOWN [CACHE_DIR]          captions for every YouTube source of that town in lib/data/sources.ts
       fetch_captions.py --list CHANNEL_URL        print "video id, title" for a channel, to find the meetings to add as sources

Writes <town>/recordings/<source id>.txt in the local source folder, one line per 30 seconds: "[h:mm:ss] words".
No video is downloaded.
These are machine transcripts: unpunctuated, with misheard names and words. A quote taken from one is
matched against this file like any other, and must be shown to readers as machine-transcribed.
Speakers give their names on the recording, so the files stay in the local cache and out of the repository.
Needs yt-dlp on the PATH. A source already in the cache is not fetched again.
"""
import json, pathlib, re, subprocess, sys, tempfile, time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import sourcelib as sl

STEP = 30


def to_lines(json3):
    out, slot, buf = [], None, []
    for ev in json.loads(json3).get("events", []):
        words = "".join(s.get("utf8", "") for s in ev.get("segs", [])).replace("\n", " ").strip()
        if not words: continue
        s = ev["tStartMs"] // 1000 // STEP
        if s != slot:
            if buf: out.append((slot * STEP, " ".join(buf)))
            slot, buf = s, []
        buf.append(words)
    if buf: out.append((slot * STEP, " ".join(buf)))
    return "\n".join(f"[{t // 3600}:{t % 3600 // 60:02d}:{t % 60:02d}] {re.sub(r' +', ' ', w)}" for t, w in out) + "\n"


def main(argv):
    if argv[0] == "--list":
        subprocess.run(["yt-dlp", "--flat-playlist", "--print", "%(id)s\t%(title)s", argv[1].rstrip("/") + "/videos"], check=True); return
    town, cache = sl.slug(argv[0]), pathlib.Path(argv[1]) if len(argv) > 1 else sl.CACHE
    failed, got = [], 0
    for src in sl.sources():
        if src["town"] != town or not src["video"]: continue
        sid, url = src["id"], src["url"]
        have = sl.find(cache, sid)
        if have and have.stat().st_size > 200: got += 1; continue
        out = sl.home(cache, src) / f"{sid}.txt"; out.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory() as tmp:
            r = subprocess.run(["yt-dlp", "--skip-download", "--write-auto-subs", "--sub-langs", "en", "--sub-format", "json3", "-o", f"{tmp}/c", url], capture_output=True, text=True)
            files = list(pathlib.Path(tmp).glob("c*.json3"))
            if not files:
                failed.append(f"{sid}  {url}  {(r.stderr.strip().splitlines() or ['no captions'])[-1][:120]}"); continue
            out.write_text(to_lines(files[0].read_text())); got += 1
        time.sleep(3)
    print(f"{got} machine transcripts in the cache")
    if failed:
        print("No captions fetched for:\n  " + "\n  ".join(failed)); sys.exit(1)


if __name__ == "__main__":
    main(sys.argv[1:])
