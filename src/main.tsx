import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* BrowserRouter wraps the app so useNavigate, Routes, etc. work */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
