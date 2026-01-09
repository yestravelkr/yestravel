import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Toaster } from 'sonner';

import { NotFound } from '../components/common/NotFound';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="min-h-screen bg-gray-50">
        <Outlet />
      </div>
      <Toaster position="top-center" richColors />
      <TanStackRouterDevtools />
    </>
  ),
  notFoundComponent: NotFound,
});
