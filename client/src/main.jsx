import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ✅ Import BrowserRouter
import App from './App.jsx';
import './index.css';
import axios from 'axios';

// Set axios base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Global error handler for network requests
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('Failed to fetch')) {
    console.error('Network fetch error:', event);
  }
});

// Intercept fetch errors
const originalFetch = window.fetch;
window.fetch = function(...args) {
  return originalFetch.apply(this, args).catch((error) => {
    console.error('Fetch failed for:', args[0], error);
    throw error;
  });
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter> {/* ✅ Wrap inside BrowserRouter */}
    <App />
  </BrowserRouter>
);
