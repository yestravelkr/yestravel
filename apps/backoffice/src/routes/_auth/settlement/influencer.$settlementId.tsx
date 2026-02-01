/**
 * Influencer Settlement Detail Page - 인플루언서 정산 상세 페이지
 *
 * 인플루언서 정산의 상세 내역을 조회합니다.
 * URL: /settlement/influencer/:settlementId
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system';
import dayjs from 'dayjs';
import { ArrowLeftIcon, DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';

import { MajorPageLayout } from '@/components/layout';
import { Card, openConfirmModal } from '@/shared/components';
import { trpc } from '@/shared/trpc';

export const Route = createFileRoute(
  '/_auth/settlement/influencer/$settlementId',
)({
  component: InfluencerSettlementDetailPage,
});

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('ko-KR').format(amount) + '원';

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

  return (
    <MajorPageLayout
      title="인플루언서 정산 상세"
      headerActions={
        <div className="flex gap-2">
          <Button
            kind="neutral"
            variant="outline"
            size="medium"
            onClick={() =>
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
              })
            }
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            목록으로
          </Button>
          <Button
            kind="neutral"
            variant="outline"
            size="medium"
            onClick={handleExcelDownload}
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            엑셀 다운로드
          </Button>
          {settlement.status === 'PENDING' && (
            <Button
              kind="primary"
              variant="solid"
              size="medium"
              onClick={handleComplete}
            >
              정산완료
            </Button>
          )}
        </div>
      }
    >
      <div className="flex gap-6">
        {/* 좌측: 캠페인별 상품 목록 */}
        <div className="flex-1 space-y-4">
          {settlement.campaignGroups.map((group) => (
            <Card key={group.campaignId}>
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-lg">{group.campaignName}</h3>
                <p className="text-sm text-gray-500">{group.campaignPeriod}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        상품
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        옵션
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                        수량
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                        매출
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                        정산금액
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.products.map((product, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="px-4 py-3 text-sm">
                          {product.productName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {product.optionName || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {product.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {formatPrice(product.sales)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {formatPrice(product.settlementAmount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-medium">
                      <td className="px-4 py-3 text-sm" colSpan={2}>
                        소계
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {group.subtotalQuantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {formatPrice(group.subtotalSales)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {formatPrice(group.subtotalAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>

        {/* 우측: 정산 정보 */}
        <div className="w-80 space-y-4">
          {/* 정산 정보 카드 */}
          <Card>
            <div className="p-4">
              <h3 className="font-semibold mb-4">정산 정보</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">인플루언서</span>
                  <span className="font-medium">
                    {settlement.influencerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">정산 기간</span>
                  <span>
                    {settlement.periodYear}년 {settlement.periodMonth}월
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">정산 예정일</span>
                  <span>
                    {dayjs(settlement.scheduledAt).format('YYYY.MM.DD')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">상태</span>
                  <span
                    className={
                      settlement.status === 'PENDING'
                        ? 'text-orange-500'
                        : 'text-green-500'
                    }
                  >
                    {settlement.status === 'PENDING' ? '정산대기' : '정산완료'}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="text-gray-500">총 매출</span>
                  <span>{formatPrice(settlement.totalSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">총 수량</span>
                  <span>{settlement.totalQuantity}건</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>총 정산금액</span>
                  <span className="text-blue-600">
                    {formatPrice(settlement.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* 정산 계좌 카드 */}
          <Card>
            <div className="p-4">
              <h3 className="font-semibold mb-4">정산 계좌</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">은행</span>
                  <span>{settlement.bankAccount.bankName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">계좌번호</span>
                  <span>{settlement.bankAccount.accountNumber || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">예금주</span>
                  <span>{settlement.bankAccount.accountHolder || '-'}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MajorPageLayout>
  );
}
