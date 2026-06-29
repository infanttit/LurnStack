import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Canonical URL redirect to avoid CORS issues and duplicate indexing
if (typeof window !== 'undefined' && window.location.hostname === 'www.lurnstack.com') {
  window.location.replace(
    'https://lurnstack.com' +
      window.location.pathname +
      window.location.search +
      window.location.hash
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

