import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import '@yestravelkr/min-design-system/index.css';
import '@yestravelkr/min-design-system/fonts.css';
import '@yestravelkr/min-design-system/theme/light-theme.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
