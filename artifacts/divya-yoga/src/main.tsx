import { createRoot } from 'react-dom/client';

import App from './App';

import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // The prototype remains usable when service workers are unavailable.
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
