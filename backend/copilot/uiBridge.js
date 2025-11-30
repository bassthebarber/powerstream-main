export const bridgeCommandToUI = (intent) => {
  switch (intent.type) {
    case "NAVIGATE":
      window.location.href = intent.payload.url;
      break;
    case "HIGHLIGHT_ELEMENT":
      const el = document.querySelector(intent.payload.selector);
      if (el) el.style.border = "2px solid gold";
      break;
    case "TOGGLE_DARK_MODE":
      document.body.classList.toggle("dark-mode");
      break;
    default:
      console.warn("Unknown UI intent:", intent);
  }
};
