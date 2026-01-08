import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

import { CampaignList, CampaignListSkeleton } from '@/components/campaign';

export const Route = createFileRoute('/i/$slug/')({
  component: InfluencerIndexPage,
});

function InfluencerIndexPage() {
  const { slug } = Route.useParams();

  return (
    <Suspense fallback={<CampaignListSkeleton />}>
      <CampaignList slug={slug} />
    </Suspense>
  );
}
