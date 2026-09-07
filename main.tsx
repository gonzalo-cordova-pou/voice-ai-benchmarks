import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource/vt323/latin-400.css';
import './app/globals.css';
import './app/library.css';
import Home from './app/page';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found.');
}

createRoot(root).render(
  <StrictMode>
    <a className="skip-link" href="#main-content">
      Skip to Content
    </a>
    <Home />
  </StrictMode>,
);
