// frontend/override/OverrideKeyMaster.js

const keyBindings = {
  'Shift+O': () => alert('Override Panel Triggered'),
  'Shift+R': () => alert('Recovery Mode Activated'),
};

export const initOverrideKeyMaster = () => {
  document.addEventListener('keydown', (e) => {
    const combo = `${e.shiftKey ? 'Shift+' : ''}${e.key.toUpperCase()}`;
    if (keyBindings[combo]) {
      keyBindings[combo]();
    }
  });
};
