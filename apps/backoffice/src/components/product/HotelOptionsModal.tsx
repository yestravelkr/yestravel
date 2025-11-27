/**
 * HotelOptionsModal - 호텔 옵션 설정 모달
 *
 * 투숙/이용기간과 옵션을 설정하는 모달입니다.
 */

import { Button } from '@yestravelkr/min-design-system';
import dayjs from 'dayjs';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import { toast } from 'sonner';

import { openDateRangePickerModal } from '@/shared/components/DateRangePickerModal';
import { FieldWrapper } from '@/shared/components/form/FieldWrapper';
import { TagsInput } from '@/shared/components/form/TagsInput';

export interface HotelOptionsData {
  startDate: string;
  endDate: string;
  options: string[];
}

interface HotelOptionsModalProps {
  defaultStartDate?: string;
  defaultEndDate?: string;
  defaultOptions?: string[];
}

function HotelOptionsModal({
  defaultStartDate,
  defaultEndDate,
  defaultOptions,
}: HotelOptionsModalProps) {
  const [startDate, setStartDate] = useState(
    defaultStartDate || dayjs().format('YYYY-MM-DD'),
  );
  const [endDate, setEndDate] = useState(
    defaultEndDate || dayjs().add(7, 'day').format('YYYY-MM-DD'),
  );
  const { resolveModal } = useCurrentModal();
  const [options, setOptions] = useState<string[]>(defaultOptions || []);

  const handleDateRangeClick = () => {
    openDateRangePickerModal({
      startDate,
      endDate,
    }).then((result) => {
      if (result) {
        setStartDate(result.startDate);
        setEndDate(result.endDate);
      }
    });
  };

  const handleConfirm = () => {
    if (!startDate || !endDate) {
      toast.error('투숙/이용기간을 입력해주세요.');
      return;
    }
    if (options.length === 0) {
      toast.error('옵션을 최소 1개 이상 입력해주세요.');
      return;
    }
    resolveModal({ startDate, endDate, options });
  };

  const handleCancel = () => {
    resolveModal(null);
  };

  const formatDateRange = () => {
    return `${dayjs(startDate).format('YY.MM.DD')} ~ ${dayjs(endDate).format('YY.MM.DD')}`;
  };

  return (
    <div className="w-[480px] p-5 bg-[var(--bg-layer)] rounded-[20px] outline outline-1 outline-offset-[-1px] outline-[var(--stroke-neutral)] flex flex-col gap-5">
      <div className="flex justify-between items-start">
        <div className="text-fg-neutral text-xl font-bold leading-7">
          옵션 설정
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <FieldWrapper label="투숙/이용기간" required isEditMode>
          <div
            className="h-11 px-3 bg-bg-field rounded-xl outline outline-1 outline-offset-[-1px] outline-[var(--stroke-neutral)] flex items-center gap-1 cursor-pointer hover:outline-[var(--stroke-hover)] transition-colors"
            onClick={handleDateRangeClick}
          >
            <div className="h-5 flex justify-start items-center overflow-hidden">
              <CalendarIcon size={20} className="text-[var(--fg-neutral)]" />
            </div>
            <div className="flex-1 px-1 flex justify-start items-start gap-2">
              <div className="flex-1 text-[var(--fg-neutral)] text-base leading-5">
                {formatDateRange()}
              </div>
            </div>
          </div>
        </FieldWrapper>

        <FieldWrapper label="옵션" required isEditMode>
          <TagsInput
            value={options}
            onChange={setOptions}
            placeholder="옵션을 입력하세요"
          />
        </FieldWrapper>
      </div>

      <div className="flex gap-2 justify-start">
        <Button
          kind="neutral"
          variant="solid"
          shape="soft"
          size="large"
          onClick={handleConfirm}
          disabled={options.length === 0}
        >
          옵션설정
        </Button>
        <Button
          kind="neutral"
          variant="outline"
          shape="soft"
          size="large"
          onClick={handleCancel}
        >
          취소
        </Button>
      </div>
    </div>
  );
}

export function openHotelOptionsModal(
  defaultValues?: HotelOptionsModalProps,
): Promise<HotelOptionsData | null> {
  return SnappyModal.show(<HotelOptionsModal {...defaultValues} />);
}

/**
 * Usage:
 *
 * // 기본값 없이 사용
 * openHotelOptionsModal().then((result) => {
 *   if (result) {
 *     console.log('Date Range:', result.startDate, result.endDate);
 *     console.log('Options:', result.options);
 *   }
 * });
 *
 * // 기본값과 함께 사용
 * openHotelOptionsModal({
 *   defaultStartDate: '2025-01-01',
 *   defaultEndDate: '2025-02-28',
 *   defaultOptions: ['조식 포함', '석식 포함']
 * }).then((result) => {
 *   if (result) {
 *     console.log('Updated:', result);
 *   }
 * });
 */
