import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '../assets/styles/index.scss';
import App from './App.tsx';

// Register service worker for web push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((_err) => {
      // SW registration failure is non-fatal; push notifications simply won't work
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
