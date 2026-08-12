import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { DelegationSessionProvider } from "./context/DelegationSessionContext";
import { StudyProvider } from "./context/StudyContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <StudyProvider><DelegationSessionProvider><App /></DelegationSessionProvider></StudyProvider>
    </HashRouter>
  </React.StrictMode>,
);
