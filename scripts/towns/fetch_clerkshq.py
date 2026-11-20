"""Zoning chapters from ClerksHQ (ClerkBase), for the towns whose official code is there (ARD D53, docs/ordinance-hosts.md).

    python3 scripts/towns/fetch_clerkshq.py            # every town below; files already saved are kept
    python3 scripts/towns/fetch_clerkshq.py --refresh

ClerksHQ builds its table of contents in the browser, but each chapter is a plain page a script can fetch once its
address is known. The addresses below were found on 2026-11-18 by opening each town's code in a browser. Saved into
.sources/<town>/ordinance/ as clerkshq-<file>.htm; organize_sources.py turns them into text.

New Shoreham is on the Secretary of State's list as ClerksHQ. Its zoning is there (books/code/NShoreAppE.htm) but stops at
Ord. 2024-11, eleven amendments behind the eCode360 copy read (found 2026-11-20, ARD D70), so it is not fetched here.
"""
import pathlib, sys, time, urllib.request

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import sourcelib as sl

UA = {"User-Agent": "ri-plan-approval/1.0 (public records)"}
BASE = "https://clerkshq.com/Content"
RICHMOND = ["1804", "1808", "1812", "1816", "1818", "1820", "1821", "1822", "1823", "1826", "1829", "1836", "1838", "1839", "1840",
            "1841", "1842", "1843", "1844", "1845", "1846", "1848", "1852", "1854", "1856", "1858", "1859"]
CHAPTERS = {
    "North Providence": [f"{BASE}/NorthProvidence-ri/books/code/chapter35.htm", f"{BASE}/NorthProvidence-ri/books/code/chapter31A.htm"],
    "Richmond": [f"{BASE}/Richmond-ri/code/RichmondRI-z{c}.htm" for c in RICHMOND],
    "Woonsocket": [f"{BASE}/Woonsocket-ri/books/code/woonappc.htm"],
}


def main():
    refresh = "--refresh" in sys.argv
    for town, urls in CHAPTERS.items():
        folder = sl.CACHE / sl.slug(town) / "ordinance"
        folder.mkdir(parents=True, exist_ok=True)
        for u in urls:
            dest = folder / f"clerkshq-{u.rsplit('/', 1)[1]}"
            if dest.exists() and not refresh: continue
            with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60) as r: dest.write_bytes(r.read())
            print(town, dest.name, dest.stat().st_size, flush=True)
            time.sleep(2)


if __name__ == "__main__":
    main()
