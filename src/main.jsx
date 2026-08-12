import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { DelegationSessionProvider } from "./context/DelegationSessionContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <DelegationSessionProvider><App /></DelegationSessionProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
