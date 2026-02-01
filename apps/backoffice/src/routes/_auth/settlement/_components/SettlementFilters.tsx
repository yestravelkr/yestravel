/**
 * SettlementFilters - 정산 목록 필터 컴포넌트
 */

import { Button } from '@yestravelkr/min-design-system';

import { SearchableSelect } from '@/shared/components';

export interface SettlementFiltersState {
  targetType: string | null;
  campaignId: string | null;
  targetId: string | null;
  periodYear: string | null;
  periodMonth: string | null;
}

interface SettlementFiltersProps {
  filters: SettlementFiltersState;
  onFiltersChange: (updates: Partial<SettlementFiltersState>) => void;
  targetTypeOptions: { value: string; label: string }[];
  campaignOptions: { value: string; label: string }[];
  influencerOptions: { value: string; label: string }[];
  brandOptions: { value: string; label: string }[];
  periodOptions: { value: string; label: string }[];
  onExcelDownload?: () => void;
}

export function SettlementFilters({
  filters,
  onFiltersChange,
  targetTypeOptions,
  campaignOptions,
  influencerOptions,
  brandOptions,
  periodOptions,
  onExcelDownload,
}: SettlementFiltersProps) {
  // 정산 대상 타입에 따라 표시할 옵션 결정
  const targetOptions =
    filters.targetType === 'BRAND' ? brandOptions : influencerOptions;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* 정산 대상 타입 */}
      <SearchableSelect
        placeholder="정산대상 유형"
        options={targetTypeOptions}
        value={filters.targetType}
        onChange={(value) =>
          onFiltersChange({ targetType: value, targetId: null })
        }
      />

      {/* 정산 대상 */}
      <SearchableSelect
        placeholder="정산대상"
        options={targetOptions}
        value={filters.targetId}
        onChange={(value) => onFiltersChange({ targetId: value })}
      />

      {/* 캠페인 */}
      <SearchableSelect
        placeholder="캠페인"
        options={campaignOptions}
        value={filters.campaignId}
        onChange={(value) => onFiltersChange({ campaignId: value })}
      />

      {/* 정산 기간 */}
      <SearchableSelect
        placeholder="정산 기간"
        options={periodOptions}
        value={
          filters.periodYear && filters.periodMonth
            ? `${filters.periodYear}-${filters.periodMonth}`
            : null
        }
        onChange={(value) => {
          if (value) {
            const [year, month] = value.split('-');
            onFiltersChange({ periodYear: year, periodMonth: month });
          } else {
            onFiltersChange({ periodYear: null, periodMonth: null });
          }
        }}
      />

      {/* 엑셀 다운로드 버튼 */}
      {onExcelDownload && (
        <Button
          kind="neutral"
          variant="outline"
          size="small"
          onClick={onExcelDownload}
        >
          엑셀 다운로드
        </Button>
      )}
    </div>
  );
}
