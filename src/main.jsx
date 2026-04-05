import React from "react";
import ReactDOM from "react-dom/client";
import App from "./AppLive.jsx";
import { app } from "./firebase";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);