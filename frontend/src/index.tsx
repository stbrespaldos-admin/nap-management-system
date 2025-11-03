import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { pwaService } from './services/pwaService';
import './styles/pwa.css';

// Global styles
const globalStyles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f8f9fa;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  button {
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
  }

  /* Remove default button styles */
  button {
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
  }

  /* Focus styles for accessibility */
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }
`;

// Inject global styles
const styleElement = document.createElement('style');
styleElement.textContent = globalStyles;
document.head.appendChild(styleElement);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Inicializar PWA después del render
if (process.env.NODE_ENV === 'production') {
  // Solo registrar Service Worker en producción
  pwaService.initializeServiceWorker()
    .then((success) => {
      if (success) {
        console.log('PWA inicializada correctamente');
      } else {
        console.warn('PWA no pudo inicializarse');
      }
    })
    .catch((error) => {
      console.error('Error inicializando PWA:', error);
    });
} else {
  console.log('PWA deshabilitada en modo desarrollo');
}