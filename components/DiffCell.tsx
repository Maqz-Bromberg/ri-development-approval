/** How a value differs from the base row: the same, a fact you would change, better, worse, or just different. */
export type Dir = "same" | "input" | "better" | "worse" | "other";
const DIR_WORD: Record<Dir, string> = { same: "", input: "you change it", better: "better", worse: "worse", other: "different" };

/** One cell of a diff table: the base value struck through and this row's beside it, or the value alone, faded, when it is the same. */
export function Diff({ was, now, dir }: { was: React.ReactNode; now: React.ReactNode; dir: Dir }) {
  if (dir === "same") return <td className="df-same"><span className="sr-only">Same: </span>{now}</td>;
  return (
    <td className={`df df-${dir}`}>
      <del><span className="sr-only">Before: </span>{was}</del>
      <ins><span className="sr-only">This row{DIR_WORD[dir] ? `, ${DIR_WORD[dir]}` : ""}: </span>{now}</ins>
    </td>
  );
}

/** A list as a diff against the base list, by id: lines added, lines dropped, and lines kept under another name. */
export function ListDiff<T extends { id: string; label: string }>({ was, now, empty = "none", icon }: { was: T[]; now: T[]; empty?: string; icon?: (x: T) => React.ReactNode }) {
  const before = new Map(was.map((x) => [x.id, x.label]));
  const after = new Set(now.map((x) => x.id));
  const added = now.filter((x) => !before.has(x.id));
  const dropped = was.filter((x) => !after.has(x.id));
  const renamed = now.filter((x) => before.has(x.id) && before.get(x.id) !== x.label);
  if (!added.length && !dropped.length && !renamed.length) return <td className="df-same">the same</td>;
  return (
    <td className="df-list">
      <ul>
        {added.map((x) => <li key={`+${x.id}`} className="dl-add"><span aria-hidden="true">+</span><span><span className="sr-only">Added: </span>{icon?.(x)}{x.label}</span></li>)}
        {dropped.map((x) => <li key={`-${x.id}`} className="dl-del"><span aria-hidden="true">−</span><span><span className="sr-only">Dropped: </span>{icon?.(x)}{x.label}</span></li>)}
        {renamed.map((x) => <li key={`~${x.id}`} className="dl-mod"><span aria-hidden="true">~</span><span><span className="sr-only">Instead: </span>{icon?.(x)}{x.label}</span></li>)}
        {!now.length && <li className="dl-mod">{empty}</li>}
      </ul>
    </td>
  );
}
