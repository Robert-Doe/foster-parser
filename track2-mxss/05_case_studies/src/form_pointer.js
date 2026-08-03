'use strict';

// Real spec behavior, narrower than what Track 1 Module 07 built: Module 07 only
// ever taught this engine about a <form> INSIDE a table (explicit clause, insert
// then immediately pop — see nonfoster.js). This is a different, more general case:
// an </form> END TAG, encountered in plain "in body" content, whose matching <form>
// is still open somewhere on the stack but is NOT the current node (something else
// opened after it, e.g. a <div>). Real spec: the form element pointer's element is
// removed from the stack directly — spliced out from wherever it sits — rather than
// popping every element above it. The tree itself is untouched; this is purely a
// stack operation, exactly as Prerequisite P3 describes stack bookkeeping being
// independent of tree structure.
function closeFormByRemovingFromStack(state) {
  for (let i = state.stack.length - 1; i >= 0; i--) {
    if (state.stack[i].tagName === 'form') {
      state.stack.splice(i, 1);
      return true;
    }
  }
  return false; // no open <form> at all — parse error, ignore (nothing to do)
}

module.exports = { closeFormByRemovingFromStack };
