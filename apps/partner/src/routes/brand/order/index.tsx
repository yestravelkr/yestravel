import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/brand/order/')({
  component: () => (
    <Navigate
      to="/brand/order/hotel"
      search={{
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
      }}
    />
  ),
});
