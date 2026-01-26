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
import { Settings } from 'lucide-react';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { ExcelProcessButtons, type ExcelRowData } from './ExcelProcessButtons';

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

interface HotelSkuData {
  checkInDate: string;
  quantity: number;
}

export function ProductOptionsPricingCard() {
  const { setValue, watch } = useFormContext();
  const hotelOptions = (watch('hotelOptions') as ExtendedHotelOption[]) || [];
  const hotelSkus = (watch('hotelSkus') as HotelSkuData[]) || [];

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

        // HotelSku[] 구조로 변환 (날짜별 재고)
        const newHotelSkus: HotelSkuData[] = dates.map((date) => ({
          checkInDate: date,
          quantity: 0, // 기본값 0
        }));

        setValue('hotelOptions', newHotelOptions);
        setValue('hotelSkus', newHotelSkus);
      }
    });
  };

  /**
   * 엑셀 다운로드용 데이터 생성
   */
  const getExcelData = (): ExcelRowData[] => {
    if (hotelOptions.length === 0) return [];

    const dates = Object.keys(hotelOptions[0].priceByDate).sort();
    const excelData: ExcelRowData[] = [];

    dates.forEach((date) => {
      hotelOptions.forEach((option) => {
        const anotherPrice = option.anotherPriceByDate?.[date] || {
          supplyPrice: 0,
          commission: 0,
        };
        const sku = hotelSkus.find((s) => s.checkInDate === date);

        excelData.push({
          날짜: date,
          옵션명: option.name,
          재고: sku?.quantity || 0,
          공급가: anotherPrice.supplyPrice || 0,
          판매가: option.priceByDate[date] || 0,
          수수료: anotherPrice.commission || 0,
        });
      });
    });

    return excelData;
  };

  /**
   * 엑셀 업로드 데이터 적용
   */
  const handleUploadData = (data: ExcelRowData[]) => {
    const optionNames = hotelOptions.map((opt) => opt.name);
    const newOptions = [...hotelOptions];
    const newSkus = [...hotelSkus];
    let updatedCount = 0;

    console.log('[ExcelUpload] 기존 옵션명:', optionNames);
    console.log(
      '[ExcelUpload] 기존 날짜:',
      hotelOptions[0]?.priceByDate
        ? Object.keys(hotelOptions[0].priceByDate)
        : [],
    );
    console.log('[ExcelUpload] 업로드 데이터:', data);

    data.forEach((row, index) => {
      const rawDate = row.날짜;
      const date = String(row.날짜);
      const optionName = String(row.옵션명);
      const optionIndex = optionNames.indexOf(optionName);

      console.log(
        `[ExcelUpload] Row ${index}: rawDate=`,
        rawDate,
        `typeof=${typeof rawDate}, date="${date}", optionName="${optionName}", optionIndex=${optionIndex}`,
      );

      if (optionIndex === -1) {
        console.log(`[ExcelUpload] Row ${index}: 옵션명 불일치 - 스킵`);
        return;
      }

      const option = newOptions[optionIndex];
      const hasDate = date in option.priceByDate;
      console.log(
        `[ExcelUpload] Row ${index}: 날짜 존재 여부=${hasDate}, priceByDate keys=`,
        Object.keys(option.priceByDate),
      );

      if (!(date in option.priceByDate)) {
        console.log(`[ExcelUpload] Row ${index}: 날짜 불일치 - 스킵`);
        return;
      }

      // 판매가 업데이트
      option.priceByDate[date] = Number(row.판매가) || 0;

      // 공급가, 수수료 업데이트
      if (!option.anotherPriceByDate) {
        option.anotherPriceByDate = {};
      }
      option.anotherPriceByDate[date] = {
        supplyPrice: Number(row.공급가) || 0,
        commission: Number(row.수수료) || 0,
      };

      // 재고 업데이트
      const skuIndex = newSkus.findIndex((s) => s.checkInDate === date);
      const stockValue = Number(row.재고) || 0;

      if (skuIndex >= 0) {
        newSkus[skuIndex].quantity = stockValue;
      } else {
        newSkus.push({ checkInDate: date, quantity: stockValue });
      }

      updatedCount++;
    });

    setValue('hotelOptions', newOptions);
    setValue('hotelSkus', newSkus);

    toast.success(`${updatedCount}개 행이 적용되었습니다.`);
  };

  const updatePrice = (
    optionIndex: number,
    date: string,
    field: 'supplyPrice' | 'sellingPrice' | 'commission' | 'stock',
    value: number,
  ) => {
    if (field === 'stock') {
      // 재고는 hotelSkus에 저장
      const newSkus = [...hotelSkus];
      const skuIndex = newSkus.findIndex((sku) => sku.checkInDate === date);

      if (skuIndex >= 0) {
        newSkus[skuIndex] = {
          ...newSkus[skuIndex],
          quantity: value,
        };
      } else {
        // 새 SKU 추가
        newSkus.push({ checkInDate: date, quantity: value });
      }

      setValue('hotelSkus', newSkus);
    } else if (field === 'sellingPrice') {
      // 판매가는 priceByDate에 저장
      const newOptions = [...hotelOptions];
      const option = newOptions[optionIndex];
      newOptions[optionIndex] = {
        ...option,
        priceByDate: {
          ...option.priceByDate,
          [date]: value,
        },
      };
      setValue('hotelOptions', newOptions);
    } else {
      // 공급가와 수수료는 anotherPriceByDate에 저장
      const newOptions = [...hotelOptions];
      const option = newOptions[optionIndex];
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

      setValue('hotelOptions', newOptions);
    }
  };

  return (
    <FormCard
      title={
        <TitleWrapper>
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
            <ExcelProcessButtons
              onGetExcelData={getExcelData}
              onUploadData={handleUploadData}
              disabled={hotelOptions.length === 0}
            />
          </ButtonGroup>
        </TitleWrapper>
      }
    >
      {hotelOptions.length > 0 ? (
        <div className="overflow-x-auto">
          <PricingTable
            hotelOptions={hotelOptions}
            hotelSkus={hotelSkus}
            onUpdatePrice={updatePrice}
          />
        </div>
      ) : (
        <div className="text-center py-8 [color:var(--fg-muted)]">
          옵션 설정 버튼을 클릭하여 가격표를 생성하세요.
        </div>
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
  hotelSkus: HotelSkuData[];
  onUpdatePrice: (
    optionIndex: number,
    date: string,
    field: 'supplyPrice' | 'sellingPrice' | 'commission' | 'stock',
    value: number,
  ) => void;
}

function PricingTable({
  hotelOptions,
  hotelSkus,
  onUpdatePrice,
}: PricingTableProps) {
  // SKU를 Map으로 변환하여 빠른 조회
  const skuMap = useMemo(() => {
    const map = new Map<string, number>();
    hotelSkus.forEach((sku) => {
      map.set(sku.checkInDate, sku.quantity);
    });
    return map;
  }, [hotelSkus]);

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
          stock: skuMap.get(date) || 0,
          supplyPrice: anotherPrice.supplyPrice,
          sellingPrice: option.priceByDate[date] || 0,
          commission: anotherPrice.commission,
        });
      });
    });

    return rows;
  }, [hotelOptions, skuMap]);

  return (
    <div className="w-full overflow-x-auto">
      <Table className="table-fixed min-w-full">
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
              <TD.Input
                type="number"
                placeholder="0"
                value={row.stock || ''}
                onChange={(e) =>
                  onUpdatePrice(
                    row.optionIndex,
                    row.date,
                    'stock',
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
      </Table>
    </div>
  );
}

/**
 * Usage:
 *
 * <FormProvider {...methods}>
 *   <ProductOptionsPricingCard />
 * </FormProvider>
 */

// Styled Components

const TitleWrapper = tw.div`
  flex items-center justify-between w-full
`;

const ButtonGroup = tw.div`
  flex gap-2
`;
