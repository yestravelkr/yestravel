/**
 * CampaignFilters - 캠페인 필터 영역 컴포넌트
 *
 * 캠페인 리스트 페이지의 필터 영역을 구성하는 컴포넌트입니다.
 * 레이아웃: 기간 | 캠페인 | 인플루언서 | 브랜드 | 초기화
 */

import { Button } from '@yestravelkr/min-design-system';
import { RotateCcw } from 'lucide-react';
import tw from 'tailwind-styled-components';

import {
  CascadingPeriodFilter,
  type PeriodFilterValues,
  type PeriodPresetOption,
  type PeriodTypeOption,
  SearchableSelect,
  type SearchableSelectOption,
} from '@/shared/components';

export interface CampaignFiltersState {
  /** 기간 타입 */
  periodType: string;
  /** 기간 프리셋 */
  periodPreset: string;
  /** 시작일 (YYYY-MM-DD) */
  startDate: string;
  /** 종료일 (YYYY-MM-DD) */
  endDate: string;
  /** 선택된 캠페인 ID */
  campaignId: string | null;
  /** 선택된 인플루언서 ID */
  influencerId: string | null;
  /** 선택된 브랜드 ID */
  brandId: string | null;
}

export interface CampaignFiltersProps {
  /** 필터 상태 */
  filters: CampaignFiltersState;
  /** 필터 변경 콜백 */
  onFiltersChange: (filters: Partial<CampaignFiltersState>) => void;
  /** 기간 타입 옵션 */
  periodTypeOptions: PeriodTypeOption[];
  /** 기간 프리셋 옵션 */
  periodPresetOptions: PeriodPresetOption[];
  /** 캠페인 옵션 */
  campaignOptions: SearchableSelectOption[];
  /** 인플루언서 옵션 */
  influencerOptions: SearchableSelectOption[];
  /** 브랜드 옵션 */
  brandOptions: SearchableSelectOption[];
  /** 초기화 클릭 */
  onReset: () => void;
}

/**
 * Usage:
 * <CampaignFilters
 *   filters={filters}
 *   onFiltersChange={handleFiltersChange}
 *   periodTypeOptions={PERIOD_TYPE_OPTIONS}
 *   periodPresetOptions={PERIOD_PRESET_OPTIONS}
 *   campaignOptions={campaignOptions}
 *   influencerOptions={influencerOptions}
 *   brandOptions={brandOptions}
 *   onReset={handleReset}
 * />
 */
export function CampaignFilters({
  filters,
  onFiltersChange,
  periodTypeOptions,
  periodPresetOptions,
  campaignOptions,
  influencerOptions,
  brandOptions,
  onReset,
}: CampaignFiltersProps) {
  const handlePeriodChange = (values: PeriodFilterValues) => {
    onFiltersChange({
      periodType: values.periodType,
      periodPreset: values.periodPreset,
      startDate: values.startDate,
      endDate: values.endDate,
    });
  };

  return (
    <Container>
      <FilterRow>
        <CascadingPeriodFilter
          periodTypeOptions={periodTypeOptions}
          periodPresetOptions={periodPresetOptions}
          value={{
            periodType: filters.periodType,
            periodPreset: filters.periodPreset,
            startDate: filters.startDate,
            endDate: filters.endDate,
          }}
          onChange={handlePeriodChange}
        />
        <SearchableSelect
          label="캠페인"
          placeholder="캠페인"
          value={filters.campaignId}
          options={campaignOptions}
          onChange={(value) => onFiltersChange({ campaignId: value })}
        />
        <SearchableSelect
          label="인플루언서"
          placeholder="인플루언서"
          value={filters.influencerId}
          options={influencerOptions}
          onChange={(value) => onFiltersChange({ influencerId: value })}
        />
        <SearchableSelect
          label="브랜드"
          placeholder="브랜드"
          value={filters.brandId}
          options={brandOptions}
          onChange={(value) => onFiltersChange({ brandId: value })}
        />
        <Button
          kind="neutral"
          variant="outline"
          size="medium"
          leadingIcon={<RotateCcw size={16} />}
          onClick={onReset}
        >
          초기화
        </Button>
      </FilterRow>
    </Container>
  );
}

const Container = tw.div`
  py-4
`;

const FilterRow = tw.div`
  flex
  flex-wrap
  items-center
  gap-2
`;
