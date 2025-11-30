import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

console.log("Studio app booting from studio-app/src");
createRoot(document.getElementById("root")).render(<App />);
