import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1A1C23',
          color: '#e2e8f0',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: '600',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#1A1C23' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#1A1C23' } },
        duration: 3500,
      }}
    />
  </StrictMode>,
);
