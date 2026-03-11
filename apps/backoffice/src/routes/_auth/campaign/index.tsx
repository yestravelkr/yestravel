/**
 * Campaign List Page - 캠페인 관리 페이지
 *
 * 캠페인 목록을 조회하고 관리하는 페이지입니다.
 * 캠페인보기 / 상품별보기 토글을 지원합니다.
 * URL: /campaign?page=1&limit=50
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import {
  CampaignFilters,
  type CampaignFiltersState,
} from './_components/CampaignFilters';
import {
  CampaignTable,
  type CampaignTableData,
  type CampaignViewMode,
} from './_components/CampaignTable';
import { openSalesLinkModal } from './_components/SalesLinkModal';

import { MajorPageLayout } from '@/components/layout';
import {
  ListPageLayout,
  openDeleteConfirmModal,
  Pagination,
  SegmentControl,
  TableToolbar,
} from '@/shared/components';
import { trpc } from '@/shared/trpc';

/** 뷰 모드 옵션 */
const VIEW_MODE_OPTIONS: { value: CampaignViewMode; label: string }[] = [
  { value: 'campaign', label: '캠페인보기' },
  { value: 'product', label: '상품별보기' },
];

/** 기간 타입 옵션 */
const PERIOD_TYPE_OPTIONS = [
  { value: 'START_DATE', label: '시작일' },
  { value: 'END_DATE', label: '종료일' },
  { value: 'CREATED_DATE', label: '등록일' },
];

/** 기간 프리셋 옵션 */
const PERIOD_PRESET_OPTIONS = [
  { value: 'today', label: '오늘' },
  { value: '7days', label: '최근 7일' },
  { value: '1month', label: '1개월' },
  { value: '2months', label: '2개월' },
  { value: '3months', label: '3개월' },
  { value: 'custom', label: '직접입력' },
];

/** URL periodType -> API periodType 매핑 */
const PERIOD_TYPE_MAP: Record<string, 'startAt' | 'endAt' | 'createdAt'> = {
  START_DATE: 'startAt',
  END_DATE: 'endAt',
  CREATED_DATE: 'createdAt',
};

interface CampaignSearchParams {
  page: number;
  limit: number;
  periodType: string;
  periodPreset: string;
  startDate: string;
  endDate: string;
  campaignId: string;
  influencerId: string;
  brandId: string;
  viewMode: CampaignViewMode;
}

export const Route = createFileRoute('/_auth/campaign/')({
  component: CampaignListPage,
  validateSearch: (search: Record<string, unknown>): CampaignSearchParams => {
    return {
      page: Number(search.page) || 1,
      limit: Number(search.limit) || 50,
      periodType: (search.periodType as string) || '',
      periodPreset: (search.periodPreset as string) || '',
      startDate: (search.startDate as string) || '',
      endDate: (search.endDate as string) || '',
      campaignId: (search.campaignId as string) || '',
      influencerId: (search.influencerId as string) || '',
      brandId: (search.brandId as string) || '',
      viewMode: (search.viewMode as CampaignViewMode) || 'campaign',
    };
  },
});

/** searchParams -> API input 변환 */
function buildApiInput(searchParams: CampaignSearchParams) {
  const apiPeriodType = PERIOD_TYPE_MAP[searchParams.periodType] ?? undefined;
  return {
    page: searchParams.page,
    limit: searchParams.limit,
    periodType: apiPeriodType,
    startDate: searchParams.startDate || undefined,
    endDate: searchParams.endDate || undefined,
    campaignId: searchParams.campaignId
      ? Number(searchParams.campaignId)
      : undefined,
    influencerId: searchParams.influencerId
      ? Number(searchParams.influencerId)
      : undefined,
    brandId: searchParams.brandId ? Number(searchParams.brandId) : undefined,
  };
}

function CampaignListPage() {
  const searchParams = Route.useSearch();
  const {
    page,
    limit,
    periodType,
    periodPreset,
    startDate,
    endDate,
    campaignId,
    influencerId,
    brandId,
    viewMode,
  } = searchParams;

  const navigate = Route.useNavigate();

  const apiInput = buildApiInput(searchParams);

  // 뷰 모드에 따라 다른 API 호출 (비활성 뷰는 최소 데이터만 조회)
  const campaignInput =
    viewMode === 'campaign' ? apiInput : { page: 1, limit: 1 };
  const productInput =
    viewMode === 'product' ? apiInput : { page: 1, limit: 1 };

  const [campaignResult] =
    trpc.backofficeCampaign.findAll.useSuspenseQuery(campaignInput);

  const [productResult] =
    trpc.backofficeCampaign.findAllByProduct.useSuspenseQuery(productInput);

  const activeResult = viewMode === 'campaign' ? campaignResult : productResult;

  const trpcUtils = trpc.useUtils();

  const deleteMutation = trpc.backofficeCampaign.delete.useMutation({
    onSuccess: () => {
      trpcUtils.backofficeCampaign.findAll.invalidate();
      trpcUtils.backofficeCampaign.findAllByProduct.invalidate();
      toast.success('캠페인이 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '캠페인 삭제에 실패했습니다.');
    },
  });

  const totalCount = activeResult.total;
  const totalPages = activeResult.totalPages;

  /** 캠페인 옵션 (필터 드롭다운용) */
  const campaignOptions =
    viewMode === 'campaign'
      ? campaignResult.data.map((c) => ({
          value: String(c.id),
          label: c.title,
        }))
      : [];

  // 인플루언서, 브랜드 옵션 (추후 별도 API 연동 예정)
  const influencerOptions: { value: string; label: string }[] = [];
  const brandOptions: { value: string; label: string }[] = [];

  const filters: CampaignFiltersState = {
    periodType,
    periodPreset,
    startDate,
    endDate,
    campaignId: campaignId || null,
    influencerId: influencerId || null,
    brandId: brandId || null,
  };

  const handlePageChange = (newPage: number) => {
    navigate({ search: { ...searchParams, page: newPage } });
  };

  const handlePageSizeChange = (newLimit: number) => {
    navigate({ search: { ...searchParams, page: 1, limit: newLimit } });
  };

  const handleFiltersChange = (updates: Partial<CampaignFiltersState>) => {
    const newSearchParams: Partial<CampaignSearchParams> = { page: 1 };

    if (updates.periodType !== undefined) {
      newSearchParams.periodType = updates.periodType;
    }
    if (updates.periodPreset !== undefined) {
      newSearchParams.periodPreset = updates.periodPreset;
    }
    if (updates.startDate !== undefined) {
      newSearchParams.startDate = updates.startDate;
    }
    if (updates.endDate !== undefined) {
      newSearchParams.endDate = updates.endDate;
    }
    if (updates.campaignId !== undefined) {
      newSearchParams.campaignId = updates.campaignId || '';
    }
    if (updates.influencerId !== undefined) {
      newSearchParams.influencerId = updates.influencerId || '';
    }
    if (updates.brandId !== undefined) {
      newSearchParams.brandId = updates.brandId || '';
    }

    navigate({ search: { ...searchParams, ...newSearchParams } });
  };

  const handleReset = () => {
    navigate({
      search: {
        page: 1,
        limit,
        periodType: '',
        periodPreset: '',
        startDate: '',
        endDate: '',
        campaignId: '',
        influencerId: '',
        brandId: '',
        viewMode,
      },
    });
  };

  const handleViewModeChange = (mode: CampaignViewMode) => {
    navigate({ search: { ...searchParams, page: 1, viewMode: mode } });
  };

  const handleRowClick = (campaign: CampaignTableData) => {
    navigate({
      to: '/campaign/$campaignId',
      params: { campaignId: String(campaign.id) },
    });
  };

  const handleSalesLinkClick = (campaign: CampaignTableData) => {
    trpcUtils.backofficeCampaign.findById
      .fetch({ id: campaign.id })
      .then((campaignDetail) => {
        openSalesLinkModal({
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          influencers: campaignDetail.influencers.map((inf) => ({
            influencerId: inf.influencerId,
            name: inf.name,
            slug: inf.slug,
            thumbnail: inf.thumbnail,
          })),
        });
      })
      .catch(() => {
        toast.error('캠페인 정보를 불러오는데 실패했습니다.');
      });
  };

  const handleEditClick = (campaign: CampaignTableData) => {
    navigate({
      to: '/campaign/$campaignId',
      params: { campaignId: String(campaign.id) },
    });
  };

  const handleDeleteClick = (campaign: CampaignTableData) => {
    openDeleteConfirmModal({
      targetName: '캠페인',
      description: '삭제된 캠페인은 복구할 수 없습니다.',
    }).then((confirmed) => {
      if (confirmed) {
        deleteMutation.mutate({ id: campaign.id });
      }
    });
  };

  return (
    <MajorPageLayout
      title="캠페인"
      headerActions={
        <CreateButton to="/campaign/create">+ 캠페인 등록</CreateButton>
      }
    >
      <ListPageLayout
        filters={
          <FilterWrapper>
            <CampaignFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              periodTypeOptions={PERIOD_TYPE_OPTIONS}
              periodPresetOptions={PERIOD_PRESET_OPTIONS}
              campaignOptions={campaignOptions}
              influencerOptions={influencerOptions}
              brandOptions={brandOptions}
              onReset={handleReset}
            />
            <SegmentControlWrapper>
              <SegmentControl
                items={VIEW_MODE_OPTIONS}
                value={viewMode}
                onChange={handleViewModeChange}
              />
            </SegmentControlWrapper>
          </FilterWrapper>
        }
        toolbar={
          <TableToolbar
            label={viewMode === 'campaign' ? '캠페인' : '상품'}
            totalCount={totalCount}
            pageSize={limit}
            onPageSizeChange={handlePageSizeChange}
          />
        }
        table={
          <CampaignTable
            viewMode={viewMode}
            campaigns={campaignResult.data}
            products={productResult.data}
            onRowClick={handleRowClick}
            onSalesLinkClick={handleSalesLinkClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        }
        pagination={
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        }
      />
    </MajorPageLayout>
  );
}

/** Styled Components */

const CreateButton = tw(Link)`
  px-4
  py-2
  bg-blue-600
  text-white
  rounded-lg
  hover:bg-blue-700
  transition-colors
  font-medium
`;

const FilterWrapper = tw.div`
  flex
  items-start
  justify-between
  gap-4
`;

const SegmentControlWrapper = tw.div`
  flex-shrink-0
  mt-4
`;
