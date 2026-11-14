# Town data checks

Each town read beyond state law keeps its data in `lib/data/towns/<town>/`. These scripts keep that data tied to the documents it quotes.

```
python3 scripts/towns/fetch_sources.py CACHE p        # download what a town cites (p = Providence's source-id prefix)
python3 scripts/towns/verify_quotes.py CACHE          # every q: "..." in lib/data/towns/*/*.ts, word for word
python3 scripts/timelines/verify.py CACHE             # dated events, including each town's timelines.json
```

`verify_quotes.py` also takes file names, so `lib/data/trees.ts` and `lib/engine.ts` can be checked the same way once their sources are in a cache.

## What cannot be automated yet

- **providenceri.gov refuses scripted requests.** `fetch_sources.py` lists those files with their URLs. Save each from a browser into the cache as `<id>.pdf` or `<id>.html` and run it again to convert them. Until then `verify_quotes.py` exits 2 and names the sources it could not check.
- **Scanned minutes.** Most of the City Plan Commission minutes since 2024 have no text layer (23 of 36). An event read from one carries `"scan": true` and a transcribed quote. `verify.py` counts and reports these and cannot match them. Text recognition (`ocrmypdf`) in the fetch step would close this.
- **The Open Meetings site limits request rate.** Keep the pause between requests.

## Rules for a town's data files

- Keep `src`, `pin` and `q` on one line, or `src` on the line above `q`. The checker pairs a quote with the nearest source named before it.
- A quote is a run of words copied from the document. Line breaks do not matter, and curly quotes are treated as straight.
- Never quote from a scanned page in a `q:`. Put it in the timeline with `"scan": true`, or summarise without a quote.
- Residents are described by role, never by name, even where the minutes name them.
