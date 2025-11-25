import { createRouter, RouterProvider } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { SnappyModalProvider } from 'react-snappy-modal';

import { routeTree } from './routeTree.gen.ts';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <SnappyModalProvider>
      <RouterProvider router={router} />
      <TanStackRouterDevtools router={router} />
    </SnappyModalProvider>
  );
}

export default App;
