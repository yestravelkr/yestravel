/**
 * OrderFilters - 주문 필터 영역 컴포넌트
 *
 * 숙박/배송 주문 목록의 필터 영역을 구성하는 컴포넌트입니다.
 * capabilities prop으로 엑셀 다운로드 버튼 표시를 제어할 수 있습니다.
 *
 * 레이아웃:
 * Row 1: 기간 | 주문상태 | 캠페인 | 인플루언서 | 상품 | 옵션
 * Row 2: (공백) | 검색input | 엑셀 버튼
 */

import { Button } from '@yestravelkr/min-design-system';
import { Download, Search } from 'lucide-react';
import tw from 'tailwind-styled-components';

import { CascadingPeriodFilter } from './base/CascadingPeriodFilter';
import { Input } from './base/Input';
import { MultiSelectDropdown } from './base/MultiSelectDropdown';
import { SearchableSelect } from './base/SearchableSelect';
import type { PeriodFilterValues, PeriodTypeOption, PeriodPresetOption } from './base/CascadingPeriodFilter';
import type { MultiSelectOption } from './base/MultiSelectDropdown';
import type { SearchableSelectOption } from './base/SearchableSelect';
import type { OrderCapabilities } from '../types/order.types';

export interface OrderFiltersState {
  /** 기간 타입 (결제일/주문일/이용일) */
  periodType: string;
  /** 기간 프리셋 (오늘/7일/1개월 등) */
  periodPreset: string;
  /** 시작일 (YYYY-MM-DD) */
  startDate: string;
  /** 종료일 (YYYY-MM-DD) */
  endDate: string;
  /** 주문 상태 */
  orderStatus: string | null;
  /** 선택된 캠페인 ID */
  campaignId: string | null;
  /** 선택된 인플루언서 ID 목록 */
  influencerIds: string[];
  /** 선택된 상품 ID */
  productId: string | null;
  /** 선택된 옵션 ID */
  optionId: string | null;
  /** 검색어 */
  searchQuery: string;
}

export interface OrderFiltersProps {
  /** 필터 상태 */
  filters: OrderFiltersState;
  /** 필터 변경 콜백 */
  onFiltersChange: (filters: Partial<OrderFiltersState>) => void;
  /** 기간 타입 옵션 */
  periodTypeOptions: PeriodTypeOption[];
  /** 기간 프리셋 옵션 */
  periodPresetOptions: PeriodPresetOption[];
  /** 주문 상태 옵션 */
  orderStatusOptions: SearchableSelectOption[];
  /** 캠페인 옵션 */
  campaignOptions: SearchableSelectOption[];
  /** 인플루언서 옵션 */
  influencerOptions: MultiSelectOption[];
  /** 상품 옵션 */
  productOptions: SearchableSelectOption[];
  /** 옵션 목록 */
  optionOptions: SearchableSelectOption[];
  /** 엑셀 다운로드 클릭 */
  onExcelDownload?: () => void;
  /** 기능 제어 (미지정 시 모든 기능 표시) */
  capabilities?: OrderCapabilities;
}

/**
 * Usage:
 *
 * <OrderFilters
 *   filters={filters}
 *   onFiltersChange={handleFiltersChange}
 *   periodTypeOptions={PERIOD_TYPE_OPTIONS}
 *   periodPresetOptions={PERIOD_PRESET_OPTIONS}
 *   orderStatusOptions={ORDER_STATUS_OPTIONS}
 *   campaignOptions={CAMPAIGN_OPTIONS}
 *   influencerOptions={INFLUENCER_OPTIONS}
 *   productOptions={PRODUCT_OPTIONS}
 *   optionOptions={OPTION_OPTIONS}
 *   onExcelDownload={handleExcelDownload}
 *   capabilities={{ canExportExcel: true }}
 * />
 */
export function OrderFilters({
  filters,
  onFiltersChange,
  periodTypeOptions,
  periodPresetOptions,
  orderStatusOptions,
  campaignOptions,
  influencerOptions,
  productOptions,
  optionOptions,
  onExcelDownload,
  capabilities,
}: OrderFiltersProps) {
  const canExportExcel = capabilities?.canExportExcel ?? true;

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
          label="주문상태"
          placeholder="주문상태"
          value={filters.orderStatus}
          options={orderStatusOptions}
          onChange={(value: string | null) => onFiltersChange({ orderStatus: value })}
        />
        <SearchableSelect
          label="캠페인"
          placeholder="캠페인"
          value={filters.campaignId}
          options={campaignOptions}
          onChange={(value: string | null) => onFiltersChange({ campaignId: value })}
        />
        <MultiSelectDropdown
          label="인플루언서"
          placeholder="인플루언서"
          values={filters.influencerIds}
          options={influencerOptions}
          onChange={(values: string[]) => onFiltersChange({ influencerIds: values })}
        />
        <SearchableSelect
          label="상품"
          placeholder="상품"
          value={filters.productId}
          options={productOptions}
          onChange={(value: string | null) => onFiltersChange({ productId: value })}
        />
        <SearchableSelect
          label="옵션"
          placeholder="옵션"
          value={filters.optionId}
          options={optionOptions}
          onChange={(value: string | null) => onFiltersChange({ optionId: value })}
        />
        <Spacer />
        <SearchInputWrapper>
          <Input
            prefix={<Search size={14} className="text-[var(--fg-muted)]" />}
            placeholder="이름, 연락처, 주문번호 검색"
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
          />
        </SearchInputWrapper>
        {canExportExcel && onExcelDownload && (
          <Button
            kind="neutral"
            variant="outline"
            size="medium"
            leadingIcon={<Download size={16} />}
            onClick={onExcelDownload}
          >
            엑셀 다운로드
          </Button>
        )}
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

const Spacer = tw.div`
  flex-1
`;

const SearchInputWrapper = tw.div`
  w-[280px]
`;
