'use strict';

const { dispatchReparse } = require('../../04_idempotent_serialization/src/dispatch_reparse.js');
const { closeFormByRemovingFromStack } = require('./form_pointer.js');

// Intercepts EndTag 'form' before anything else, exactly the same pattern every
// Track 2 module has used to layer a narrow, targeted fix on top of the previous
// module's chain. Everything else delegates to T2-04's dispatchReparse (which
// itself delegates to Track 1's dispatch13, plus the explicit-tbody fix).
function dispatchCaseStudy(token, state, log) {
  if (token.type === 'EndTag' && token.tagName === 'form') {
    closeFormByRemovingFromStack(state);
    return;
  }
  return dispatchReparse(token, state, log);
}

module.exports = { dispatchCaseStudy };
