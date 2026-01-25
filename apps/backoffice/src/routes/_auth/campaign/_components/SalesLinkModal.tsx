/**
 * SalesLinkModal - 판매링크 인플루언서 선택 모달
 *
 * 캠페인의 판매링크로 이동할 때 인플루언서를 선택하는 모달입니다.
 */

import { Button } from '@yestravelkr/min-design-system';
import { ExternalLink, User } from 'lucide-react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

const SHOP_URL = import.meta.env.VITE_SHOP_URL || 'http://localhost:5174';

interface Influencer {
  influencerId: number;
  name: string;
  slug: string | null;
  thumbnail: string | null;
}

interface SalesLinkModalProps {
  campaignId: number;
  campaignTitle: string;
  influencers: Influencer[];
}

function SalesLinkModal({
  campaignId,
  campaignTitle,
  influencers,
}: SalesLinkModalProps) {
  const { resolveModal } = useCurrentModal();

  const handleSelectInfluencer = (influencer: Influencer) => {
    if (!influencer.slug) {
      toast.error(`${influencer.name}의 slug가 설정되지 않았습니다.`);
      return;
    }

    const salesUrl = `${SHOP_URL}/i/${influencer.slug}/c/${campaignId}`;
    window.open(salesUrl, '_blank', 'noopener,noreferrer');
    resolveModal();
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>판매링크 - 인플루언서 선택</HeaderTitle>
      </Header>

      <Content>
        <CampaignName>{campaignTitle}</CampaignName>

        {influencers.length === 0 ? (
          <EmptyMessage>등록된 인플루언서가 없습니다.</EmptyMessage>
        ) : (
          <InfluencerList>
            {influencers.map((influencer) => (
              <InfluencerItem
                key={influencer.influencerId}
                onClick={() => handleSelectInfluencer(influencer)}
                $disabled={!influencer.slug}
              >
                <InfluencerAvatar>
                  {influencer.thumbnail ? (
                    <AvatarImage
                      src={influencer.thumbnail}
                      alt={influencer.name}
                    />
                  ) : (
                    <User size={24} />
                  )}
                </InfluencerAvatar>
                <InfluencerInfo>
                  <InfluencerName>{influencer.name}</InfluencerName>
                  <InfluencerSlug>
                    {influencer.slug ? `@${influencer.slug}` : '(slug 미설정)'}
                  </InfluencerSlug>
                </InfluencerInfo>
                <ExternalLink size={18} className="text-gray-400" />
              </InfluencerItem>
            ))}
          </InfluencerList>
        )}
      </Content>

      <Footer>
        <Button kind="neutral" variant="outline" onClick={() => resolveModal()}>
          닫기
        </Button>
      </Footer>
    </Container>
  );
}

/**
 * 판매링크 인플루언서 선택 모달 열기
 *
 * Usage:
 * openSalesLinkModal({
 *   campaignId: 1,
 *   campaignTitle: '캠페인명',
 *   influencers: [{ influencerId: 1, name: '홍길동', slug: 'hong', thumbnail: null }],
 * });
 */
export function openSalesLinkModal(params: SalesLinkModalProps): Promise<void> {
  return SnappyModal.show(
    <SalesLinkModal
      campaignId={params.campaignId}
      campaignTitle={params.campaignTitle}
      influencers={params.influencers}
    />,
    { position: 'center' },
  );
}

// Styled Components

const Container = tw.div`
  w-[400px]
  bg-white
  rounded-2xl
  flex flex-col
  overflow-hidden
`;

const Header = tw.div`
  px-6 py-4
  border-b border-gray-100
`;

const HeaderTitle = tw.h2`
  text-lg font-semibold text-gray-900
`;

const Content = tw.div`
  px-6 py-4
  flex flex-col gap-4
`;

const CampaignName = tw.div`
  text-sm text-gray-500
  pb-2
  border-b border-gray-100
`;

const EmptyMessage = tw.div`
  text-center
  py-8
  text-gray-400
`;

const InfluencerList = tw.div`
  flex flex-col gap-2
  max-h-80 overflow-y-auto
`;

const InfluencerItem = tw.button<{ $disabled?: boolean }>`
  flex items-center gap-3
  p-3
  rounded-lg
  border border-gray-100
  text-left
  transition-colors
  ${({ $disabled }) =>
    $disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'hover:bg-gray-50 hover:border-gray-200 cursor-pointer'}
`;

const InfluencerAvatar = tw.div`
  w-10 h-10
  rounded-full
  bg-gray-100
  flex items-center justify-center
  overflow-hidden
  flex-shrink-0
`;

const AvatarImage = tw.img`
  w-full h-full
  object-cover
`;

const InfluencerInfo = tw.div`
  flex-1
  min-w-0
`;

const InfluencerName = tw.div`
  font-medium
  text-gray-900
  truncate
`;

const InfluencerSlug = tw.div`
  text-sm
  text-gray-500
  truncate
`;

const Footer = tw.div`
  px-6 py-4
  border-t border-gray-100
  flex justify-end
`;
