/**
 * ProductOptionsPricingCard - 상품 옵션 및 가격 설정 카드
 *
 * 상품의 옵션과 가격 정보를 입력하는 컴포넌트입니다.
 */

import { Button } from '@yestravelkr/min-design-system';
import { Settings, Sheet } from 'lucide-react';

import { openHotelOptionsModal } from '@/components/product/HotelOptionsModal';
import { FormCard } from '@/shared/components/form/FormLayout';

export function ProductOptionsPricingCard() {
  const handleOptionSetup = () => {
    openHotelOptionsModal().then((result) => {
      if (result) {
        console.log('옵션 설정 결과:', result);
        // TODO: 옵션 데이터 처리
      }
    });
  };

  const handleExcelProcess = () => {
    // TODO: 엑셀 처리 기능
    console.log('엑셀 처리');
  };

  return (
    <FormCard
      title={
        <div className="flex items-center justify-between w-full">
          <span>옵션 및 가격</span>
          <div className="flex gap-2">
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
          </div>
        </div>
      }
    >
      {/* TODO: 옵션 및 가격 입력 UI 추가 예정 */}
    </FormCard>
  );
}

/**
 * Usage:
 *
 * <ProductOptionsPricingCard />
 */
