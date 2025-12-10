// frontend/studio-app/src/main.jsx
// Entry point for PowerHarmony AI Recording Studio
// Mounts App to the #root element

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

console.log("PowerHarmony Studio booting from studio-app/src");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
