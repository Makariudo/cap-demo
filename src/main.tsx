import React from 'react'; // Import React
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App'; // Remove .tsx extension

const rootElement = document.getElementById('root');

if (rootElement) { // Type guard to ensure element exists
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  console.error("Failed to find the root element");
}