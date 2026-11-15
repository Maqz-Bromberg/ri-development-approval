/*
 * The engine's flowcharts as data (ARD D41). One Flow per component of the engine; the overview is a Flow whose
 * nodes link to the others. Every node says what happens, and names the code it describes in `where`
 * ("lib/engine.ts#classify"), which scripts/check_engine_flows.py checks still exists.
 */

/**
 * data      a fact or a value that moves between parts
 * step      something the code does
 * decision  a branch
 * town      where a town's own reading is asked for first
 * gap       where the engine says it has not read something, or cannot
 * output    what a part hands on
 */
export type NodeKind = "data" | "step" | "decision" | "town" | "gap" | "output";

export type Side = "top" | "bottom" | "left" | "right";

export interface FlowNode {
  id: string;
  kind: NodeKind;
  label: string;
  /** A second, smaller line inside the node */
  sub?: string;
  /** Position in grid units: columns left to right, rows top to bottom. Fractions are fine. */
  x: number;
  y: number;
  /** What happens here, shown on hover */
  info: string;
  /** Something to watch for: why it is this way, what it cannot do, the decision behind it */
  note?: string;
  /** Code this node describes, as "path#symbol" or "path" */
  where?: string[];
  /** Marks a node whose answer comes from the town first, when the town has read it */
  town?: boolean;
  /** Where the node leads: another flowchart, or a page of the site */
  to?: { href: string; label: string };
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  /** A dependency that is not the main line of work */
  dashed?: boolean;
  /** Which side of the node the line leaves and enters. Chosen from the positions when left out. */
  out?: Side;
  in?: Side;
}

export interface Flow {
  slug: string;
  title: string;
  /** One line, on the overview's node and the page's list */
  blurb: string;
  /** What this part of the engine is for, in a paragraph or two */
  intro: string;
  /** The overview's nodes are bigger and open the page of the part when clicked */
  size?: "lg";
  nodes: FlowNode[];
  edges: FlowEdge[];
  /** Pages of the site that show what this part produces */
  shows?: { href: string; label: string }[];
}

export const KIND_LABEL: Record<NodeKind, { name: string; what: string }> = {
  data: { name: "Fact or value", what: "Something the engine holds or passes on" },
  step: { name: "Step", what: "Something the code does" },
  decision: { name: "Branch", what: "The code chooses here" },
  town: { name: "Town's own reading", what: "Asked of the town first, when it has been read" },
  gap: { name: "Named gap", what: "Where the engine says it has not read, or cannot" },
  output: { name: "Result", what: "What this part hands on" },
};

export const n = (id: string, kind: NodeKind, label: string, x: number, y: number, info: string, more: Partial<FlowNode> = {}): FlowNode =>
  ({ id, kind, label, x, y, info, ...more });

export const e = (from: string, to: string, label?: string, more: Partial<FlowEdge> = {}): FlowEdge =>
  ({ from, to, ...(label ? { label } : {}), ...more });
