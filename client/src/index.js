import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./utils/reportWebVitals";
import { GlobalStateProvider } from "./state";
import { Breakpoints, BreakpointProvider } from "./utils/breakpoint";

const queries = {
  xs: `(max-width: ${Breakpoints.xs}px)`,
  sm: `(min-width: ${Breakpoints.xs + 1}px) and (max-width: ${
    Breakpoints.sm
  }px)`,
  md: `(min-width: ${Breakpoints.sm + 1}px) and (max-width: ${
    Breakpoints.md
  }px)`,
  lg: `(min-width: ${Breakpoints.md + 1}px) and (max-width: ${
    Breakpoints.lg
  }px)`,
};

ReactDOM.render(
  <React.StrictMode>
    <GlobalStateProvider>
      <BreakpointProvider queries={queries}>
        <App />
      </BreakpointProvider>
    </GlobalStateProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
