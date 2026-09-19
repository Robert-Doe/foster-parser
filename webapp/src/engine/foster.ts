// Ported verbatim (CommonJS -> ES module syntax only; logic unchanged) from
// track1-core/02_two_conditions_one_gate/src/foster.js in this repo.
// The two-condition gate from "appropriate place for inserting a node" step 2.
export const FOSTER_PARENT_TARGETS: ReadonlySet<string> = Object.freeze(new Set(['table', 'tbody', 'tfoot', 'thead', 'tr']));

export function isFosterParentingTarget(state: any): boolean {
  const target = state.stack[state.stack.length - 1];
  return (
    Boolean(state.fosterParentingEnabled) &&
    Boolean(target) &&
    FOSTER_PARENT_TARGETS.has(target.tagName)
  );
}
