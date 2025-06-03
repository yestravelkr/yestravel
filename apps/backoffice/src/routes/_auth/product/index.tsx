import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';

// import { requireAuth } from '@/shared';
// import api from '@/shared/axios';
import { Role } from '@/store';

export const Route = createFileRoute('/_auth/product/')({
  component: RouteComponent,
  // beforeLoad: requireAuth([Role.ADMIN]),
});

function RouteComponent() {
  useEffect(() => {
    const test = async () => {
      // const result = await api.get('/protected');
      // console.log(result.data);
    };

    test();
  }, []);

  return <div>Hello "/_auth/product/"!</div>;
}
