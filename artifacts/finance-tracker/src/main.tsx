import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const originalFetch = window.fetch.bind(window);

window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof input === "string" && input.startsWith("/api")) {
    return originalFetch(`${API_BASE}${input}`, init);
  }

  if (input instanceof Request) {
    const url = input.url;
    if (url.startsWith("/api")) {
      return originalFetch(`${API_BASE}${url}`, init);
    }
  }

  return originalFetch(input as any, init);
}) as typeof window.fetch;




createRoot(document.getElementById("root")!).render(<App />);
