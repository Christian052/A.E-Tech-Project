import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import "./index.css";

// Ignore benign external extension / harness errors such as iframe chrome: message timeouts
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event?.reason?.message || String(event?.reason || "");
    if (
      reason.includes("chrome: call method") ||
      reason.includes("ResizeObserver loop") ||
      reason.includes("Extension context invalidated")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  });

  window.addEventListener("error", (event) => {
    const msg = event?.message || String(event || "");
    if (
      msg.includes("chrome: call method") ||
      msg.includes("ResizeObserver loop") ||
      msg.includes("Extension context invalidated")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <ScrollToTop />

      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);