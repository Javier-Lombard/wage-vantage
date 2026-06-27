import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { AuthProvider } from '@/app/providers/AuthProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { store } from '@/app/store';

import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
