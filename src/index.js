import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import { UserProvider } from "./context/UserContext";
import { ProgressProvider } from "./context/ProgressContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <UserProvider>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </UserProvider>
);
