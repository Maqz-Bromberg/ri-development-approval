"""Where a cited document lives in the local source folder, shared by the fetch and check scripts.

Layout (docs/ARD.md, D9):   .sources/<town>/<kind>/<source id>.<ext>   plus <source id>.txt beside it
  town   the municipality the document belongs to, or "state"
  kind   rules | meetings | recordings | projects | press | pages

Nothing has to be filed by hand: a source's town and kind are worked out from its entry in
lib/data/sources.ts, and every script finds a file by its id wherever it sits under the folder.
A source belongs to the town named in its label. Where the label names no town, or the wrong one,
the entry carries `town: "<Name>"` (or "State").
"""
import pathlib, re, subprocess, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[1]
CACHE = ROOT / ".sources"
KINDS = ["rules", "meetings", "recordings", "projects", "press", "pages"]
# Hosts that answer 403 to a script. Their files are saved by hand.
REFUSES = {"www.providenceri.gov", "providenceri.gov"}
ENTRY = re.compile(r'^\s*(\w+): \{ label: "((?:[^"\\]|\\.)*)", url: "([^"]+)"(?:, town: "([^"]+)")? \}', re.M)


def towns():
    text = (ROOT / "lib/data/towns.ts").read_text()
    names = set()
    for group in re.findall(r'^  (?:Bristol|Kent|Newport|Providence|Washington): \[([^\]]+)\]', text, re.M): names.update(re.findall(r'"([^"]+)"', group))
    return sorted(names, key=len, reverse=True)  # longest first, so "North Providence" wins over "Providence"


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def kind_of(label, url):
    if "youtube.com" in url or "youtu.be" in url: return "recordings"
    if "Gen. Laws" in label: return "rules"
    if re.search(r"\b(agenda|minutes|docket)\b", label, re.I) or "DownloadMeetingFiles" in url: return "meetings"
    if re.search(r"staff report|staff memo| v\. |Superior Court", label, re.I): return "projects"
    if re.search(r"pressreader|valleybreeze", url): return "press"
    if re.search(r"Gen\. Laws|Ordinance|Regulations|schedule|application|Summary of|Manual", label, re.I): return "rules"
    return "rules" if ".pdf" in url.lower() else "pages"


def sources():
    """Every source: id, label, url, town folder, kind, file extension, and whether its host refuses scripts."""
    names, out = towns(), []
    for sid, label, url, town in ENTRY.findall((ROOT / "lib/data/sources.ts").read_text()):
        place = town or next((n for n in names if re.search(rf"\b{re.escape(n)}\b", label)), "State")
        host = urllib.parse.urlparse(url).netloc
        video = "youtube.com" in url or "youtu.be" in url
        out.append({"id": sid, "label": label, "url": url, "town": slug(place), "kind": kind_of(label, url),
                    "ext": ".txt" if video else ".pdf" if ".pdf" in url.lower() else ".html", "by_hand": host in REFUSES, "video": video,
                    "basename": urllib.parse.unquote(urllib.parse.urlparse(url).path.rsplit("/", 1)[-1])})
    return out


def find(cache, sid, ext=".txt"):
    """The file for a source id, wherever it sits under the folder. None when it is not there."""
    return next(iter(sorted(pathlib.Path(cache).rglob(f"{sid}{ext}"))), None)


def home(cache, src):
    """The folder a source's files belong in."""
    return pathlib.Path(cache) / src["town"] / src["kind"]


def to_text(path):
    """Write <name>.txt beside a PDF or HTML file. Returns the size of the text, which is near zero for a scan."""
    path = pathlib.Path(path); out = path.with_suffix(".txt")
    if path.suffix == ".pdf": subprocess.run(["pdftotext", "-layout", str(path), str(out)], check=True)
    elif path.suffix in (".html", ".htm"): out.write_text(re.sub(r"<[^>]+>", " ", path.read_bytes().decode("utf-8", "replace")))
    return out.stat().st_size if out.exists() else 0
