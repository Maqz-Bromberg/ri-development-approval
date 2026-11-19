import type { Finding } from "../../types";

/*
 * Shared by the towns read in chunk 6 (ARD D63): a use table's row, read from its quote, and the finding it gives.
 * Each town keeps its own columns, its map from the Zoning Atlas's district names to them, and what its cells mean.
 */

export type Value = "allowed" | "hearing" | "prohibited";
export const ST: Record<Value, Finding["st"]> = { allowed: "pass", hearing: "flag", prohibited: "fail" };
export const WORD: Record<Value, string> = { allowed: "permitted", hearing: "allowed by special use permit", prohibited: "not allowed" };
export const RANK: Record<Value, number> = { allowed: 0, hearing: 1, prohibited: 2 };

/** The cells of a row, from the last `n` words of its quote, mapped to the columns. Tokens are kept as printed. */
export function cellsOf<C extends string>(cols: readonly C[], q: string, tokens?: string[]): Record<C, string> {
  const t = tokens ?? q.split(/\s+/).slice(-cols.length);
  return Object.fromEntries(cols.map((c, k) => [c, t[k]])) as Record<C, string>;
}

/** P, Y and YES permit; S asks a special use permit; N, X and NO forbid. Anything else is for the town file to read. */
export function plain(cell: string): Value | null {
  const c = cell.replace(/\*+|\(.*\)/g, "").trim().toUpperCase();
  if (c === "P" || c === "Y" || c === "YES") return "allowed";
  if (c === "S") return "hearing";
  if (c === "N" || c === "X" || c === "NO") return "prohibited";
  return null;
}

/** The finding for a use answered from a town's own table, in place of the Zoning Atlas. */
export function useFinding(a: { id: string; town: string; what: string; zone: string; value: Value; why?: string[]; flag?: boolean; src: string; pin: string; q: string; gap?: string }): { value: Value; finding: Finding } {
  const why = (a.why ?? []).filter(Boolean);
  return {
    value: a.value,
    finding: {
      id: a.id, st: a.flag ? "flag" : ST[a.value], t: `${a.what}: ${WORD[a.value]} in ${a.zone}`,
      p: `${why.join(" ")}${why.length ? " " : ""}From ${a.town}'s own use table, not the Zoning Atlas.`,
      src: a.src, pin: a.pin, q: a.q, ...(a.gap ? { gap: a.gap } : {}),
    },
  };
}
