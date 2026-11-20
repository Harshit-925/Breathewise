import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import { AppProvider } from './context/AppContext.js';
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </React.StrictMode>
  );
}
