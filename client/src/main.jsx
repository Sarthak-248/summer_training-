import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ✅ Import BrowserRouter
import App from './App.jsx';
import './index.css';
import axios from 'axios';

// Set axios base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter> {/* ✅ Wrap inside BrowserRouter */}
    <App />
  </BrowserRouter>
);
