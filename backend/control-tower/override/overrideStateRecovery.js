// backend/control-tower/override/overrideStateRecovery.js

let lastKnownState = {};

const saveOverrideState = (state) => {
  lastKnownState = { ...state, timestamp: Date.now() };
};

const getOverrideState = () => {
  return lastKnownState;
};

const restoreOverrideState = () => {
  return lastKnownState || {};
};

module.exports = {
  saveOverrideState,
  getOverrideState,
  restoreOverrideState
};
