import { RouterProvider, createRouter } from '@tanstack/react-router';
import { SnappyModalProvider } from 'react-snappy-modal';

import { routeTree } from './routeTree.gen';

import { TRPCProvider } from '@/shared';

// Import the generated route tree

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <TRPCProvider>
      <SnappyModalProvider>
        <RouterProvider router={router} />
      </SnappyModalProvider>
    </TRPCProvider>
  );
}

export default App;
