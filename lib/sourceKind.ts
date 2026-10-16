/** Short label for a source id, used where space is tight. */
export function sourceKind(id: string): string {
  if (id.startsWith("vid")) return "Video";
  if (id.startsWith("min")) return "Minutes";
  if (id.startsWith("memo")) return "Memo";
  if (id.startsWith("pb")) return "Agenda";
  if (id === "call2017" || id === "vb2025") return "Press";
  if (id === "s2268") return "Testimony";
  if (id.startsWith("riza") || id === "nzaRI") return "Atlas";
  if (id.startsWith("s")) return "Statute";
  return "Source";
}
