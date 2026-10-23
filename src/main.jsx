import "./shim.js"; // must come first — installs window.storage and the API route
import React from "react";
import { createRoot } from "react-dom/client";
import PromptLab from "./PromptLab.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PromptLab />
  </React.StrictMode>
);
