# Town data checks

Each town read beyond state law keeps its data in `lib/data/towns/<town>/`. These scripts keep that data tied to the documents it quotes. The decisions behind them are in `docs/ARD.md`.

Cited documents live in `.sources/` at the top of the repository. The folder is not committed.

```
.sources/<town>/<kind>/<source id>.pdf|html      and <source id>.txt beside it
         town: state, cumberland, providence, ...   kind: rules, meetings, recordings, projects, press, pages
.sources/INDEX.md                                  every source: in hand, scanned or missing
```

Nothing is filed by hand. `scripts/sourcelib.py` works out a source's town and kind from its entry in `lib/data/sources.ts`, and every script finds a file by its id wherever it sits.

```
python3 scripts/towns/fetch_sources.py providence    # download what a script can reach (also: state, cumberland)
python3 scripts/towns/fetch_captions.py providence   # machine transcripts of the recordings (needs yt-dlp)
python3 scripts/towns/organize_sources.py            # file anything loose, convert to text, rewrite INDEX.md
python3 scripts/towns/verify_quotes.py               # every q: "..." in lib/data/towns/*/*.ts, word for word
python3 scripts/towns/verify_quotes.py lib/data/state/trees.ts lib/engine.ts    # the same for state law and the engine
python3 scripts/timelines/verify.py .sources         # dated events, including each town's timelines.json
```

`fetch_captions.py --list https://www.youtube.com/@pvdcpc` prints a channel's videos, to find the id of a meeting.

## Adding a town

1. Add its sources to `lib/data/sources.ts`, one per line, with the town's name in each label. Where a label names no town, add `town: "<Name>"`.
2. Run `fetch_sources.py <town>` and `fetch_captions.py <town>`. They create the town's folders.
3. Save by hand whatever the fetch lists as refused, then run `organize_sources.py`.

## Saving a file by hand

providenceri.gov refuses scripted requests, and `fetch_sources.py` lists those files with their URLs. Save each from a browser anywhere inside `.sources/`, under whatever name the browser gives it, and run `organize_sources.py`. It recognises the file by the name in its URL, renames it to its source id, files it and converts it to text. A file it cannot place is left alone and listed.

## What cannot be automated yet

- **Scanned minutes.** Most of the City Plan Commission minutes since 2024 have no text layer (23 of 36). An event read from one carries `"scan": true` and a transcribed quote. `verify.py` counts and reports these and cannot match them. Text recognition (`ocrmypdf`) in the fetch step would close this.
- **A recording with no captions.** The Sept 16, 2025 meeting has none. It would need local speech recognition on the audio.
- **The Open Meetings site limits request rate.** Keep the pause between requests.

## Rules for a town's data files

- Keep `src`, `pin` and `q` on one line, or `src` on the line above `q`. The checker pairs a quote with the nearest source named before it.
- A quote is a run of words copied from the document. Line breaks do not matter, and curly quotes are treated as straight.
- Never quote from a scanned page in a `q:`. Put it in the timeline with `"scan": true`, or summarise without a quote.
- A machine transcript can be quoted for a hearing concern, copied exactly as the captions have it, errors included, with `t` set to the second the passage starts. A decision comes from the minutes. One that rests only on a recording must carry `"gap"` saying why (ARD, D7).
- Residents are described by role, never by name, even where the minutes or the recording name them.
