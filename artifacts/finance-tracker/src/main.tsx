import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
// main.tsx (TOP OF FILE, before ReactDOM.render)

const API_BASE = import.meta.env.VITE_API_URL;

const originalFetch = window.fetch;

window.fetch = (input: any, init?: any) => {
  if (typeof input === "string" && input.startsWith("/api")) {
    return originalFetch(`${API_BASE}${input}`, init);
  }
  return originalFetch(input, init);
};