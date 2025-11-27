/**
 * ProductOptionsPricingCard - 상품 옵션 및 가격 설정 카드
 *
 * 상품의 옵션과 가격 정보를 입력하는 컴포넌트입니다.
 */

import { Button } from '@yestravelkr/min-design-system';
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from '@yestravelkr/min-design-system';
import type { HotelOption } from '@yestravelkr/option-selector';
import { Settings, Sheet } from 'lucide-react';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import { openHotelOptionsModal } from '@/components/product/HotelOptionsModal';
import { FormCard } from '@/shared/components/form/FormLayout';

interface TableRowData {
  date: string;
  optionIndex: number;
  optionName: string;
  stock: number;
  supplyPrice: number;
  sellingPrice: number;
  commission: number;
}

interface ExtendedHotelOption extends Omit<HotelOption, 'id'> {
  id?: number;
  anotherPriceByDate?: Record<
    string,
    { supplyPrice: number; commission: number }
  >;
}

export function ProductOptionsPricingCard() {
  const { setValue, watch } = useFormContext();
  const hotelOptions = (watch('hotelOptions') as ExtendedHotelOption[]) || [];

  const handleOptionSetup = () => {
    // hotelOptions에서 현재 dateRange 계산
    let defaultStartDate: string | undefined;
    let defaultEndDate: string | undefined;

    if (hotelOptions.length > 0) {
      const dates = Object.keys(hotelOptions[0].priceByDate).sort();
      if (dates.length > 0) {
        defaultStartDate = dates[0];
        defaultEndDate = dates[dates.length - 1];
      }
    }

    openHotelOptionsModal({
      defaultStartDate,
      defaultEndDate,
      defaultOptions: hotelOptions.map((opt) => opt.name),
    }).then((result) => {
      if (result) {
        // HotelOption[] 구조로 변환
        const dates = generateDateRange(result.startDate, result.endDate);
        const newHotelOptions: ExtendedHotelOption[] = result.options.map(
          (optionName) => {
            const priceByDate: Record<string, number> = {};
            const anotherPriceByDate: Record<
              string,
              { supplyPrice: number; commission: number }
            > = {};

            dates.forEach((date) => {
              priceByDate[date] = 0; // 판매가
              anotherPriceByDate[date] = { supplyPrice: 0, commission: 0 }; // 공급가, 수수료
            });

            return {
              name: optionName,
              priceByDate,
              anotherPriceByDate,
            };
          },
        );

        setValue('hotelOptions', newHotelOptions);
      }
    });
  };

  const handleExcelProcess = () => {
    // TODO: 엑셀 처리 기능
    console.log('엑셀 처리');
  };

  const updatePrice = (
    optionIndex: number,
    date: string,
    field: 'supplyPrice' | 'sellingPrice' | 'commission',
    value: number,
  ) => {
    const newOptions = [...hotelOptions];
    const option = newOptions[optionIndex];

    if (field === 'sellingPrice') {
      // 판매가는 priceByDate에 저장
      newOptions[optionIndex] = {
        ...option,
        priceByDate: {
          ...option.priceByDate,
          [date]: value,
        },
      };
    } else {
      // 공급가와 수수료는 anotherPriceByDate에 저장
      const anotherPriceByDate = option.anotherPriceByDate || {};
      const currentData = anotherPriceByDate[date] || {
        supplyPrice: 0,
        commission: 0,
      };

      newOptions[optionIndex] = {
        ...option,
        anotherPriceByDate: {
          ...anotherPriceByDate,
          [date]: {
            ...currentData,
            [field]: value,
          },
        },
      };
    }

    setValue('hotelOptions', newOptions);
  };

  return (
    <FormCard
      title={
        <TitleContainer>
          <span>옵션 및 가격</span>
          <ButtonGroup>
            <Button
              kind="neutral"
              variant="outline"
              shape="soft"
              size="medium"
              onClick={handleOptionSetup}
              leadingIcon={<Settings size={20} />}
            >
              옵션 설정
            </Button>
            <Button
              kind="neutral"
              variant="outline"
              shape="soft"
              size="medium"
              onClick={handleExcelProcess}
              leadingIcon={<Sheet size={20} />}
            >
              엑셀 처리
            </Button>
          </ButtonGroup>
        </TitleContainer>
      }
    >
      {hotelOptions.length > 0 ? (
        <PricingTable hotelOptions={hotelOptions} onUpdatePrice={updatePrice} />
      ) : (
        <EmptyState>옵션 설정 버튼을 클릭하여 가격표를 생성하세요.</EmptyState>
      )}
    </FormCard>
  );
}

function generateDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);

  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

interface PricingTableProps {
  hotelOptions: ExtendedHotelOption[];
  onUpdatePrice: (
    optionIndex: number,
    date: string,
    field: 'supplyPrice' | 'sellingPrice' | 'commission',
    value: number,
  ) => void;
}

function PricingTable({ hotelOptions, onUpdatePrice }: PricingTableProps) {
  // 테이블 행 데이터 생성
  const tableRows = useMemo(() => {
    const rows: TableRowData[] = [];

    if (hotelOptions.length === 0) return rows;

    // 모든 날짜 수집 (첫 번째 옵션에서)
    const dates = Object.keys(hotelOptions[0].priceByDate).sort();

    // 날짜별로 각 옵션에 대한 행 생성
    dates.forEach((date) => {
      hotelOptions.forEach((option, optionIndex) => {
        const anotherPrice = option.anotherPriceByDate?.[date] || {
          supplyPrice: 0,
          commission: 0,
        };

        rows.push({
          date,
          optionIndex,
          optionName: option.name,
          stock: 0, // TODO: SKU와 연동 필요
          supplyPrice: anotherPrice.supplyPrice,
          sellingPrice: option.priceByDate[date] || 0,
          commission: anotherPrice.commission,
        });
      });
    });

    return rows;
  }, [hotelOptions]);

  return (
    <PricingTableWrapper>
      <StyledTable>
        <THead>
          <TR>
            <TH>날짜</TH>
            <TH>옵션명</TH>
            <TH>재고</TH>
            <TH>공급가</TH>
            <TH>판매가</TH>
            <TH>수수료</TH>
          </TR>
        </THead>
        <TBody>
          {tableRows.map((row) => (
            <TR key={`${row.date}-${row.optionIndex}`}>
              <TD>{row.date}</TD>
              <TD>{row.optionName}</TD>
              <TD>{row.stock}</TD>
              <TD.Input
                type="number"
                placeholder="0"
                value={row.sellingPrice || ''}
                onChange={(e) =>
                  onUpdatePrice(
                    row.optionIndex,
                    row.date,
                    'sellingPrice',
                    Number(e.target.value),
                  )
                }
                min={0}
              />
              <TD.Input
                type="number"
                placeholder="0"
                value={row.supplyPrice || ''}
                onChange={(e) =>
                  onUpdatePrice(
                    row.optionIndex,
                    row.date,
                    'supplyPrice',
                    Number(e.target.value),
                  )
                }
                min={0}
              />
              <TD.Input
                type="number"
                placeholder="0"
                value={row.commission || ''}
                onChange={(e) =>
                  onUpdatePrice(
                    row.optionIndex,
                    row.date,
                    'commission',
                    Number(e.target.value),
                  )
                }
                min={0}
              />
            </TR>
          ))}
        </TBody>
      </StyledTable>
    </PricingTableWrapper>
  );
}

// Styled Components
const TitleContainer = tw.div`
  flex
  items-center
  justify-between
  w-full
`;

const ButtonGroup = tw.div`
  flex
  gap-2
`;

const EmptyState = tw.div`
  text-center
  py-8
  [color:var(--fg-muted)]
`;

const PricingTableWrapper = tw.div`
  w-full
  overflow-x-auto
`;

const StyledTable = tw(Table)`
  table-fixed
  min-w-full
`;

/**
 * Usage:
 *
 * <FormProvider {...methods}>
 *   <ProductOptionsPricingCard />
 * </FormProvider>
 */
