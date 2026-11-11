import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import DemoPage from "./components/DemoPage";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DemoPage />
  </React.StrictMode>
);
