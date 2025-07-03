import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Uncaught errors için global handler
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('frame')) {
    event.preventDefault();
  }
});

// Unhandled promise rejections için handler
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.toString().includes('frame')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
