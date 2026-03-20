import { AdminSharedProvider } from '@yestravelkr/admin-shared';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// deploy trigger
import App from './App.tsx';

import { TRPCProvider } from '@/shared';
import { trpc } from '@/shared/trpc';

import '@yestravelkr/min-design-system/index.css';
import '@yestravelkr/min-design-system/fonts.css';
import '@yestravelkr/min-design-system/theme/light-theme.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TRPCProvider>
      <AdminSharedProvider trpc={trpc}>
        <App />
      </AdminSharedProvider>
    </TRPCProvider>
  </StrictMode>,
);
