import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/order/')({
  beforeLoad: () => {
    throw redirect({
      to: '/order/hotel',
      search: {
        page: 1,
        limit: 50,
        periodType: '',
        periodPreset: '',
        startDate: '',
        endDate: '',
        orderStatus: '',
        campaignId: '',
        influencerIds: '',
        productId: '',
        optionId: '',
        searchQuery: '',
      },
    });
  },
  component: () => null,
});
