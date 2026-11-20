/*
 * A project is kept by share link and project file (ARD principle 5). A link someone saved must keep opening, so the
 * tokens below are frozen: if a change to lib/share.ts stops one decoding to the same project, that change breaks
 * every link of that kind already handed out. Add a token here when the format gains a field; never edit one.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_INPUTS, normalizeInputs } from "@/lib/engine";
import { decodeState, encodeState, fromFile, readShareHash, toFile, type Saved } from "@/lib/share";

const SAVED: Saved = {
  inputs: normalizeInputs({ town: "Westerly", zone: "HDR-6", units: 12, aff: 3, address: "1 Main Street", lot: 87000, sewer: false, overlays: ["APZ"] }),
  override: "minor",
  checked: { "minor/prelim/site-plan/0": true },
  notes: { "minor/prelim": "Ask about the aquifer column" },
  hearing: ["traffic"],
  pins: [{ id: "f:wezo:inclusionary", type: "finding", resolved: true, at: "2026-11-20T09:00:00.000Z" }],
};

const b64url = (s: string) => Buffer.from(s, "utf8").toString("base64url");

test("a share link opens the same project", () => {
  assert.deepEqual(decodeState(encodeState(SAVED)), SAVED);
  assert.deepEqual(readShareHash(`#p=${encodeState(SAVED)}`), SAVED);
  assert.deepEqual(readShareHash(`#x=1&p=${encodeState(SAVED)}`), SAVED);
});

test("a project file opens the same project", () => {
  assert.deepEqual(fromFile(toFile(SAVED)), SAVED);
  assert.equal(fromFile(JSON.stringify({ app: "something-else", v: 1, i: {}, o: "auto", c: [], n: {} })), null);
});

test("a broken or foreign link is refused, not half read", () => {
  assert.equal(decodeState("not-a-token"), null);
  assert.equal(decodeState(b64url(JSON.stringify({ v: 2, i: {} }))), null);
  assert.equal(readShareHash("#q=abc"), null);
});

test("a link made before hearing picks and pins were kept still opens (format v1, no h or k)", () => {
  const s = decodeState(b64url(JSON.stringify({ v: 1, i: { town: "Providence", units: 8 }, o: "auto", c: ["dpr/adpr/plan/0"], n: {} })));
  assert.equal(s?.inputs.town, "Providence");
  assert.equal(s?.inputs.units, 8);
  assert.deepEqual(s?.hearing, []);
  assert.deepEqual(s?.pins, []);
  assert.deepEqual(s?.checked, { "dpr/adpr/plan/0": true });
});

test("a link made before kinds of project were asked reads commercial floor area as mixed use", () => {
  const s = decodeState(b64url(JSON.stringify({ v: 1, i: { units: 8, commercial: 3000 }, o: "auto", c: [], n: {} })));
  assert.equal(s?.inputs.kind, "mixed");
});

test("frozen tokens: links handed out keep opening to the same project", () => {
  // Made with encodeState on 2026-11-20. Never edit; add a new one when the format changes.
  const FROZEN_2026_11_20 = "eyJ2IjoxLCJpIjp7Im92ZXJsYXlzIjpbIkFQWiJdLCJ0b3duIjoiV2VzdGVybHkiLCJhZGRyZXNzIjoiMSBNYWluIFN0cmVldCIsInVuaXRzIjoxMiwiYWZmIjozLCJ6b25lIjoiSERSLTYiLCJsb3QiOjg3MDAwLCJzZXdlciI6ZmFsc2V9LCJvIjoibWlub3IiLCJjIjpbIm1pbm9yL3ByZWxpbS9zaXRlLXBsYW4vMCJdLCJuIjp7Im1pbm9yL3ByZWxpbSI6IkFzayBhYm91dCB0aGUgYXF1aWZlciBjb2x1bW4ifSwiaCI6WyJ0cmFmZmljIl0sImsiOltbImY6d2V6bzppbmNsdXNpb25hcnkiLCJmaW5kaW5nIiwxLCIyMDI2LTExLTIwVDA5OjAwOjAwLjAwMFoiXV19";
  assert.deepEqual(decodeState(FROZEN_2026_11_20), SAVED);
});

test("only what differs from the example goes in the link, so links stay short", () => {
  const token = encodeState({ inputs: { ...DEFAULT_INPUTS }, override: "auto", checked: {}, notes: {} });
  assert.deepEqual(JSON.parse(Buffer.from(token, "base64url").toString("utf8")).i, {});
});
