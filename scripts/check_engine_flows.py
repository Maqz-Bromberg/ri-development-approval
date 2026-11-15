#!/usr/bin/env python3
"""Check the engine flowcharts in lib/data/engine/ against the code they describe.

- every `where: ["path#symbol"]` names a file that exists and, after the #, a word that appears in it;
- every line (edge) joins two boxes that exist in the same flowchart, and no box id is used twice in one;
- every link to another part (/engine/<slug>) has a flowchart.

usage: check_engine_flows.py        exit 1 on any problem. Reports; it does not edit (ARD principle 8).
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
DIR = ROOT / "lib" / "data" / "engine"
problems = []
slugs = set()
files = [f for f in sorted(DIR.glob("*.ts")) if f.name not in ("types.ts", "index.ts")]

for f in files:
    text = f.read_text()
    m = re.search(r'\bslug: "([\w-]*)"', text)
    if m and m.group(1):
        slugs.add(m.group(1))

checked = 0
for f in files:
    text = f.read_text()
    ids = re.findall(r'\bn\(\s*"([\w]+)"', text)
    for i in {x for x in ids if ids.count(x) > 1}:
        problems.append(f"{f.name}: box id {i!r} is used twice")
    for a, b in re.findall(r'\be\(\s*"(\w+)",\s*"(\w+)"', text):
        for x in (a, b):
            if x not in ids:
                problems.append(f"{f.name}: a line names {x!r}, which is not a box here")
    for href in re.findall(r'href: "/engine/([\w-]+)"', text):
        if href not in slugs:
            problems.append(f"{f.name}: links to /engine/{href}, which has no flowchart")
    for arr in re.findall(r'where: \[([^\]]*)\]', text):
        for w in re.findall(r'"([^"]+)"', arr):
            path, _, sym = w.partition("#")
            target = ROOT / path
            checked += 1
            if not target.exists():
                problems.append(f"{f.name}: {w}: no such file")
            elif sym and not re.search(r"\b" + re.escape(sym) + r"\b", target.read_text()):
                problems.append(f"{f.name}: {w}: {sym!r} is not in {path}")

for p in problems:
    print("FAIL", p)
print(f"{len(files)} flowcharts, {checked} code pointers checked, {len(problems)} problems")
sys.exit(1 if problems else 0)
