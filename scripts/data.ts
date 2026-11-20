/*
 * The site's data as JSON, for the Python scripts (ARD debt 11): every source in lib/data/sources.ts, by id, and the
 * 39 municipalities' names from lib/data/towns.ts. Read through `sourcelib.data()`, so no script parses the TypeScript
 * as text and the data files can be formatted freely. Run by sourcelib.py; by hand:
 *
 *   node --import ./scripts/engine/register.mjs scripts/data.ts
 */
import { SOURCES } from "@/lib/data/sources";
import { TOWNS } from "@/lib/data/towns";

process.stdout.write(JSON.stringify({ sources: SOURCES, towns: TOWNS.map((t) => t.name) }));
