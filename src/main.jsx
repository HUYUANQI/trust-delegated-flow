import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { DelegationSessionProvider } from "./context/DelegationSessionContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <DelegationSessionProvider><App /></DelegationSessionProvider>
    </HashRouter>
  </React.StrictMode>,
);
