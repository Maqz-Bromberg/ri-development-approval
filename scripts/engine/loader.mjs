// Lets Node run the site's TypeScript directly (Node 24 strips the types): resolves "@/..." to the repository root,
// adds the .ts or .tsx a bare import leaves out, and reads a JSON import as a module. Used by snapshot.ts.
import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const EXT = [".ts", ".tsx", "/index.ts"];

export async function resolve(spec, ctx, next) {
  let file = null;
  if (spec.startsWith("@/")) file = path.join(ROOT, spec.slice(2));
  else if ((spec.startsWith("./") || spec.startsWith("../")) && ctx.parentURL?.startsWith("file:")) file = path.resolve(path.dirname(fileURLToPath(ctx.parentURL)), spec);
  if (file) {
    const hit = existsSync(file) && statSync(file).isFile() ? file : EXT.map((e) => file + e).find((f) => existsSync(f));
    if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true };
  }
  return next(spec, ctx);
}

export async function load(url, ctx, next) {
  if (url.endsWith(".json")) return { format: "module", source: `export default ${readFileSync(fileURLToPath(url), "utf8")};`, shortCircuit: true };
  if (url.endsWith(".ts") || url.endsWith(".tsx")) return { format: "module-typescript", source: readFileSync(fileURLToPath(url), "utf8"), shortCircuit: true };
  return next(url, ctx);
}
