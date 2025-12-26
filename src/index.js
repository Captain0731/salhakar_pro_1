// index.js
// Suppress MetaMask connection errors
// MetaMask extension automatically tries to connect, but this app doesn't use it

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

// Suppress console errors - set up immediately after imports
const originalError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() || '';
  const fullMessage = args.map(arg => String(arg)).join(' ');
  
  // Suppress MetaMask connection errors
  if (
    message.includes('Failed to connect to MetaMask') ||
    (message.includes('MetaMask') && message.includes('connect')) ||
    fullMessage.includes('Failed to connect to MetaMask') ||
    (fullMessage.includes('MetaMask') && fullMessage.includes('connect')) ||
    (typeof args[0] === 'string' && args[0].includes('Failed to connect to MetaMask'))
  ) {
    return; // Suppress MetaMask connection errors only
  }
  
  // Suppress generic cross-origin "Script error" noise
  if (message === 'Script error.' || fullMessage.includes('Script error.')) {
    return;
  }

  originalError.apply(console, args);
};

// Global error handler to catch MetaMask connection errors
window.addEventListener('error', (event) => {
  const errorMessage = event.message || event.error?.message || '';
  const errorStack = event.error?.stack || '';
  const errorSource = event.filename || '';
  
  // Helper: detect cross-origin/extension source
  const isExtension = errorSource.startsWith('chrome-extension://') || /chrome-extension|extensions/i.test(errorStack);
  let isCrossOrigin = false;
  try {
    if (errorSource) {
      const srcUrl = new URL(errorSource, window.location.origin);
      isCrossOrigin = srcUrl.origin !== window.location.origin;
    }
  } catch {
    // If parsing fails, treat as cross-origin
    isCrossOrigin = true;
  }

  // Suppress MetaMask connection errors
  if (
    errorMessage.includes('Failed to connect to MetaMask') ||
    (errorMessage.includes('MetaMask') && errorMessage.includes('connect')) ||
    errorStack.includes('Failed to connect to MetaMask') ||
    (errorStack.includes('MetaMask') && errorStack.includes('connect')) ||
    errorSource.includes('nkbihfbeogaeaoehlefnkodbefgpgknn') // MetaMask extension ID
  ) {
    event.preventDefault(); // Prevent error from showing in console
    event.stopPropagation(); // Stop error propagation
    return false;
  }

  // Suppress generic cross-origin "Script error." from third-party/extension scripts
  if (errorMessage === 'Script error.' || (isCrossOrigin || isExtension)) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true); // Use capture phase to catch errors early

// Handle unhandled promise rejections related to MetaMask connection
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.message || event.reason?.toString() || '';
  const reasonStack = event.reason?.stack || '';
  
  // Suppress MetaMask connection errors
  if (
    reason.includes('Failed to connect to MetaMask') ||
    (reason.includes('MetaMask') && reason.includes('connect')) ||
    reasonStack.includes('Failed to connect to MetaMask') ||
    (reasonStack.includes('MetaMask') && reasonStack.includes('connect'))
  ) {
    event.preventDefault(); // Prevent error from showing
    return false;
  }

  // Suppress generic cross-origin "Script error" rejections
  if (reason === 'Script error.' || /Script error\./.test(reasonStack)) {
    event.preventDefault();
    return false;
  }
});

// Create root and render the app wrapped in BrowserRouter and ErrorBoundary
ReactDOM.createRoot(document.getElementById("root")).render(
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
);
