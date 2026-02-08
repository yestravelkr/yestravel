/**
 * Influencer Settlement Detail Page - 인플루언서 정산 상세 페이지
 *
 * 인플루언서 정산의 상세 내역을 조회합니다.
 * URL: /settlement/influencer/:settlementId
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import { SettlementDetailContent } from './_components';

import { openConfirmModal } from '@/shared/components';
import { trpc } from '@/shared/trpc';

export const Route = createFileRoute(
  '/_auth/settlement/influencer/$settlementId',
)({
  component: InfluencerSettlementDetailPage,
});

function InfluencerSettlementDetailPage() {
  const { settlementId } = Route.useParams();
  const navigate = useNavigate();

  const [settlement] =
    trpc.backofficeSettlement.findInfluencerSettlementById.useSuspenseQuery({
      id: parseInt(settlementId, 10),
    });

  const trpcUtils = trpc.useUtils();

  const completeMutation =
    trpc.backofficeSettlement.completeInfluencerSettlements.useMutation({
      onSuccess: () => {
        trpcUtils.backofficeSettlement.findInfluencerSettlementById.invalidate();
        toast.success('정산이 완료되었습니다.');
        navigate({
          to: '/settlement',
          search: {
            page: 1,
            limit: 50,
            status: '',
            targetType: '',
            campaignId: '',
            targetId: '',
            periodYear: '',
            periodMonth: '',
          },
        });
      },
      onError: (error) => {
        toast.error(error.message || '정산 완료에 실패했습니다.');
      },
    });

  const exportMutation = trpc.backofficeSettlement.exportToExcel.useMutation({
    onSuccess: (data) => {
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('엑셀이 다운로드됩니다.');
    },
    onError: (error) => {
      toast.error(error.message || '엑셀 다운로드에 실패했습니다.');
    },
  });

  const handleComplete = async () => {
    const confirmed = await openConfirmModal({
      title: '정산을 완료 처리하시겠습니까?',
    });

    if (confirmed) {
      completeMutation.mutate({ ids: [parseInt(settlementId, 10)] });
    }
  };

  const handleExcelDownload = () => {
    exportMutation.mutate({
      settlementId: parseInt(settlementId, 10),
      targetType: 'INFLUENCER',
    });
  };

  const handleBackToList = () => {
    navigate({
      to: '/settlement',
      search: {
        page: 1,
        limit: 50,
        status: '',
        targetType: '',
        campaignId: '',
        targetId: '',
        periodYear: '',
        periodMonth: '',
      },
    });
  };

  return (
    <SettlementDetailContent
      title="인플루언서 정산 상세"
      settlement={settlement}
      targetLabel="인플루언서"
      targetName={settlement.influencerName}
      onBackToList={handleBackToList}
      onExcelDownload={handleExcelDownload}
      onComplete={handleComplete}
    />
  );
}
