// backend/control-tower/override/overrideStateRecovery.js

let lastKnownState = {};

export const saveOverrideState = (state) => {
  lastKnownState = { ...state, timestamp: Date.now() };
};

export const getOverrideState = () => {
  return lastKnownState;
};

export const restoreOverrideState = () => {
  return lastKnownState || {};
};

export default {
  saveOverrideState,
  getOverrideState,
  restoreOverrideState
};
