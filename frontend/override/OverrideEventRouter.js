// frontend/override/OverrideEventRouter.js

const overrideEventBus = {};

export const registerOverrideEvent = (eventName, handler) => {
  overrideEventBus[eventName] = handler;
};

export const triggerOverrideEvent = (eventName, data) => {
  if (overrideEventBus[eventName]) {
    overrideEventBus[eventName](data);
  }
};
