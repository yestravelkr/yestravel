/**
 * InfluencerSalesSettingModal - 인플루언서 판매설정 모달
 *
 * 캠페인에 추가된 인플루언서의 판매 설정을 관리하는 모달입니다.
 * 기간, 수수료, 상품별 커미션 등을 설정할 수 있습니다.
 */

import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  useTabs,
} from '@yestravelkr/min-design-system';
import dayjs from 'dayjs';
import { Calendar, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

import type {
  CampaignInfluencerFormData,
  CampaignInfluencerProductFormData,
} from '@/routes/_auth/campaign/_components/types';
import { openDateRangePickerModal } from '@/shared/components/DateRangePickerModal';

interface DefaultDateRange {
  startDate: string;
  endDate: string;
}

interface CampaignProduct {
  id: number;
  name: string;
}

interface InfluencerSalesSettingModalProps {
  influencer: CampaignInfluencerFormData;
  influencerName: string;
  defaultDateRange: DefaultDateRange;
  campaignProducts: CampaignProduct[];
}

interface InfluencerSalesSettingResult {
  influencerId: number;
  periodType: 'DEFAULT' | 'CUSTOM';
  startAt: string | null;
  endAt: string | null;
  feeType: 'NONE' | 'CUSTOM';
  fee: number | null;
  status: 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT';
  products: CampaignInfluencerProductFormData[];
}

const MAIN_TABS = [
  { label: '캠페인 설정', value: 'campaign' as const },
  { label: '상품 판매 설정', value: 'productSales' as const },
];

/**
 * 캠페인 설정 탭 콘텐츠
 */
function CampaignSettingTabContent({
  periodType,
  onPeriodTypeChange,
  customDateRange,
  onCustomDateRangeChange,
  defaultDateRange,
  fee,
  onFeeChange,
}: {
  periodType: 'DEFAULT' | 'CUSTOM';
  onPeriodTypeChange: (type: 'DEFAULT' | 'CUSTOM') => void;
  customDateRange: {
    startDate: string;
    endDate: string;
  };
  onCustomDateRangeChange: (range: {
    startDate: string;
    endDate: string;
  }) => void;
  defaultDateRange: DefaultDateRange;
  fee: number;
  onFeeChange: (fee: number) => void;
}) {
  const displayDateRange =
    periodType === 'DEFAULT' ? defaultDateRange : customDateRange;

  const handleDateRangeClick = async () => {
    const result = await openDateRangePickerModal({
      startDate: customDateRange.startDate,
      endDate: customDateRange.endDate,
    });
    if (result) {
      onCustomDateRangeChange({
        startDate: result.startDate,
        endDate: result.endDate,
      });
      // 날짜를 선택하면 자동으로 직접 입력 모드로 전환
      onPeriodTypeChange('CUSTOM');
    }
  };

  return (
    <CampaignSettingContainer>
      {/* 캠페인 기간 */}
      <SettingField>
        <SettingLabel>캠페인 기간</SettingLabel>
        <RadioGroup>
          <RadioOption
            $selected={periodType === 'DEFAULT'}
            onClick={() => onPeriodTypeChange('DEFAULT')}
          >
            <RadioCircle $selected={periodType === 'DEFAULT'} />
            <RadioLabel>기본값</RadioLabel>
          </RadioOption>
          <RadioOption
            $selected={periodType === 'CUSTOM'}
            onClick={() => onPeriodTypeChange('CUSTOM')}
          >
            <RadioCircle $selected={periodType === 'CUSTOM'} />
            <RadioLabel>직접 입력</RadioLabel>
          </RadioOption>
        </RadioGroup>
        <DateRangeInput
          type="button"
          onClick={handleDateRangeClick}
          disabled={periodType === 'DEFAULT'}
          $disabled={periodType === 'DEFAULT'}
        >
          <Calendar size={20} />
          <DateRangeText>
            {dayjs(displayDateRange.startDate).format('YY.MM.DD')} ~{' '}
            {dayjs(displayDateRange.endDate).format('YY.MM.DD')}
          </DateRangeText>
        </DateRangeInput>
      </SettingField>

      {/* 진행비 */}
      <SettingField>
        <SettingLabel>진행비</SettingLabel>
        <FeeInputWrapper>
          <FeeInput
            type="text"
            value={fee.toLocaleString()}
            onChange={(event) => {
              const value = event.target.value.replace(/,/g, '');
              const numValue = parseInt(value, 10) || 0;
              onFeeChange(numValue);
            }}
            placeholder="0"
          />
          <FeeUnit>원</FeeUnit>
        </FeeInputWrapper>
      </SettingField>
    </CampaignSettingContainer>
  );
}

/**
 * 상품 판매 설정 탭 콘텐츠
 */
function ProductSalesSettingTabContent({
  campaignProducts,
  selectedProductIndex,
  onSelectProduct,
  influencerProducts,
  onInfluencerProductsChange,
}: {
  campaignProducts: CampaignProduct[];
  selectedProductIndex: number;
  onSelectProduct: (index: number) => void;
  influencerProducts: CampaignInfluencerProductFormData[];
  onInfluencerProductsChange: (
    products: CampaignInfluencerProductFormData[],
  ) => void;
}) {
  // 현재 선택된 상품의 인플루언서 설정 찾기
  const currentProduct = campaignProducts[selectedProductIndex];
  const currentInfluencerProduct = influencerProducts.find(
    (product) => product.productId === currentProduct?.id,
  );

  // 상품 설정 업데이트 헬퍼
  const updateProductSetting = (
    updates: Partial<CampaignInfluencerProductFormData>,
  ) => {
    if (!currentProduct) return;

    const existingIndex = influencerProducts.findIndex(
      (product) => product.productId === currentProduct.id,
    );

    const updatedProducts = [...influencerProducts];
    if (existingIndex >= 0) {
      updatedProducts[existingIndex] = {
        ...updatedProducts[existingIndex],
        ...updates,
      };
    } else {
      updatedProducts.push({
        productId: currentProduct.id,
        status: 'VISIBLE',
        useCustomCommission: false,
        hotelOptions: [],
        ...updates,
      });
    }
    onInfluencerProductsChange(updatedProducts);
  };

  const handleStatusChange = (status: 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT') => {
    updateProductSetting({ status });
  };

  const handleUseCustomCommissionChange = (useCustom: boolean) => {
    updateProductSetting({ useCustomCommission: useCustom });
  };

  if (campaignProducts.length === 0) {
    return (
      <ProductSalesContainer>
        <EmptyProductMessage>
          캠페인에 추가된 상품이 없습니다.
        </EmptyProductMessage>
      </ProductSalesContainer>
    );
  }

  return (
    <ProductSalesContainer>
      {/* 상품 탭 */}
      <ProductTabsRow>
        <ProductTabs>
          {campaignProducts.map((product, index) => (
            <ProductChip
              key={product.id}
              $selected={selectedProductIndex === index}
              onClick={() => onSelectProduct(index)}
            >
              <ProductChipLabel>{product.name}</ProductChipLabel>
            </ProductChip>
          ))}
        </ProductTabs>
        <ExcelButton type="button">
          <FileSpreadsheet size={20} />
          <ExcelButtonLabel>엑셀 처리</ExcelButtonLabel>
        </ExcelButton>
      </ProductTabsRow>

      {/* 설정 카드 */}
      <SettingCard>
        {/* 노출 상태 */}
        <SettingRow $hasBorder>
          <SettingInfo>
            <SettingTitle>노출 상태</SettingTitle>
            <SettingDescription>
              상품의 노출 상태를 설정합니다.
            </SettingDescription>
          </SettingInfo>
          <VisibilitySelect
            value={currentInfluencerProduct?.status ?? 'VISIBLE'}
            onChange={(event) =>
              handleStatusChange(
                event.target.value as 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT',
              )
            }
          >
            <option value="VISIBLE">노출</option>
            <option value="HIDDEN">미노출</option>
            <option value="SOLD_OUT">품절</option>
          </VisibilitySelect>
        </SettingRow>

        {/* 별도 수수료 설정 */}
        <SettingRow $hasBorder={false}>
          <SettingInfo>
            <SettingTitle>별도 수수료 설정</SettingTitle>
            <SettingDescription>
              상품 설정과 다른 수수료를 적용하는 경우 설정해 주세요.
            </SettingDescription>
          </SettingInfo>
          <ToggleSwitch
            $active={currentInfluencerProduct?.useCustomCommission ?? false}
            onClick={() =>
              handleUseCustomCommissionChange(
                !currentInfluencerProduct?.useCustomCommission,
              )
            }
          >
            <ToggleKnob
              $active={currentInfluencerProduct?.useCustomCommission ?? false}
            />
          </ToggleSwitch>
        </SettingRow>
      </SettingCard>

      {/* 수수료 테이블 - TODO: 호텔 옵션 데이터 연동 필요 */}
      {currentInfluencerProduct?.useCustomCommission && (
        <CommissionTableContainer>
          <Table>
            <THead>
              <TR>
                <TH>날짜</TH>
                <TH>옵션명</TH>
                <TH>판매가</TH>
                <TH>수수료</TH>
              </TR>
            </THead>
            <TBody>
              <TR>
                <TD colSpan={4}>
                  <EmptyProductMessage>
                    호텔 옵션 데이터 연동이 필요합니다.
                  </EmptyProductMessage>
                </TD>
              </TR>
            </TBody>
          </Table>
        </CommissionTableContainer>
      )}
    </ProductSalesContainer>
  );
}

function InfluencerSalesSettingModal({
  influencer,
  influencerName,
  defaultDateRange,
  campaignProducts,
}: InfluencerSalesSettingModalProps) {
  const { resolveModal } = useCurrentModal();
  const { selectedTab, TabComponents: MainTabComponents } = useTabs(MAIN_TABS);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);

  // 캠페인 설정 상태
  const [periodType, setPeriodType] = useState<'DEFAULT' | 'CUSTOM'>(
    influencer.periodType,
  );
  const [customDateRange, setCustomDateRange] = useState({
    startDate: influencer.startAt || defaultDateRange.startDate,
    endDate: influencer.endAt || defaultDateRange.endDate,
  });
  const [fee, setFee] = useState<number>(influencer.fee || 0);

  // 인플루언서별 상품 설정 상태
  const [influencerProducts, setInfluencerProducts] = useState<
    CampaignInfluencerProductFormData[]
  >(influencer.products);

  const handleConfirm = () => {
    const result: InfluencerSalesSettingResult = {
      influencerId: influencer.influencerId,
      periodType,
      startAt: periodType === 'CUSTOM' ? customDateRange.startDate : null,
      endAt: periodType === 'CUSTOM' ? customDateRange.endDate : null,
      feeType: fee > 0 ? 'CUSTOM' : 'NONE',
      fee: fee > 0 ? fee : null,
      status: influencer.status,
      products: influencerProducts,
    };
    resolveModal(result);
  };

  const handleCancel = () => {
    resolveModal(null);
  };

  return (
    <Container>
      {/* 헤더 영역 */}
      <HeaderSection>
        <HeaderTitle>{influencerName}</HeaderTitle>
        <MainTabComponents />
      </HeaderSection>

      {/* 콘텐츠 영역 */}
      <Content>
        {selectedTab === 'campaign' ? (
          <CampaignSettingTabContent
            periodType={periodType}
            onPeriodTypeChange={setPeriodType}
            customDateRange={customDateRange}
            onCustomDateRangeChange={setCustomDateRange}
            defaultDateRange={defaultDateRange}
            fee={fee}
            onFeeChange={setFee}
          />
        ) : (
          <ProductSalesSettingTabContent
            campaignProducts={campaignProducts}
            selectedProductIndex={selectedProductIndex}
            onSelectProduct={setSelectedProductIndex}
            influencerProducts={influencerProducts}
            onInfluencerProductsChange={setInfluencerProducts}
          />
        )}
      </Content>

      {/* 푸터 영역 */}
      <Footer>
        <ConfirmButton type="button" onClick={handleConfirm}>
          확인
        </ConfirmButton>
        <CancelButton type="button" onClick={handleCancel}>
          취소
        </CancelButton>
      </Footer>
    </Container>
  );
}

export function openInfluencerSalesSettingModal(
  influencer: CampaignInfluencerFormData,
  influencerName: string,
  defaultDateRange: DefaultDateRange,
  campaignProducts: CampaignProduct[],
): Promise<InfluencerSalesSettingResult | null> {
  return SnappyModal.show(
    <InfluencerSalesSettingModal
      influencer={influencer}
      influencerName={influencerName}
      defaultDateRange={defaultDateRange}
      campaignProducts={campaignProducts}
    />,
    {
      position: 'center',
    },
  );
}

// ============================================
// Styled Components
// ============================================

const Container = tw.div`
  w-[640px]
  p-5
  bg-[var(--bg-layer)]
  rounded-[20px]
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  inline-flex
  flex-col
  justify-start
  items-start
  gap-5
  overflow-hidden
`;

const HeaderSection = tw.div`
  self-stretch
  flex
  flex-col
  justify-start
  items-start
  gap-2
`;

const HeaderTitle = tw.div`
  self-stretch
  h-9
  inline-flex
  justify-start
  items-center
  gap-2
  text-[var(--fg-neutral)]
  text-xl
  font-bold
  leading-7
`;

const Content = tw.div`
  self-stretch
  flex
  flex-col
  gap-5
`;

const CampaignSettingContainer = tw.div`
  self-stretch
  flex
  flex-col
  gap-5
`;

const SettingField = tw.div`
  self-stretch
  flex
  flex-col
  gap-2
`;

const SettingLabel = tw.div`
  text-[var(--fg-muted)]
  text-base
  font-normal
  leading-5
`;

const RadioGroup = tw.div`
  self-stretch
  inline-flex
  justify-start
  items-center
  gap-2
`;

const RadioOption = tw.div<{ $selected: boolean }>`
  flex-1
  py-2
  flex
  justify-start
  items-start
  gap-1
  cursor-pointer
`;

const RadioCircle = tw.div<{ $selected: boolean }>`
  w-5
  h-5
  rounded-full
  border-2
  flex
  justify-center
  items-center
  ${({ $selected }) =>
    $selected
      ? 'border-[var(--fg-primary)] bg-[var(--fg-primary)]'
      : 'border-[var(--fg-disabled)]'}
  after:content-['']
  after:w-2
  after:h-2
  after:rounded-full
  ${({ $selected }) => ($selected ? 'after:bg-white' : 'after:bg-transparent')}
`;

const RadioLabel = tw.div`
  text-[var(--fg-neutral)]
  text-base
  font-normal
  leading-5
`;

const DateRangeInput = tw.button<{ $disabled: boolean }>`
  self-stretch
  h-11
  px-3
  bg-[var(--bg-field)]
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  inline-flex
  justify-start
  items-center
  gap-2
  transition-colors
  ${({ $disabled }) =>
    $disabled
      ? 'text-[var(--fg-disabled)] cursor-not-allowed opacity-60'
      : 'text-[var(--fg-neutral)] cursor-pointer'}
`;

const DateRangeText = tw.span`
  flex-1
  text-left
  text-base
  font-normal
  leading-5
`;

const FeeInputWrapper = tw.div`
  self-stretch
  h-11
  px-3
  bg-[var(--bg-field)]
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  inline-flex
  justify-start
  items-center
  gap-1
`;

const FeeInput = tw.input`
  flex-1
  bg-transparent
  text-[var(--fg-neutral)]
  text-base
  font-normal
  leading-5
  outline-none
  text-right
`;

const FeeUnit = tw.span`
  text-[var(--fg-muted)]
  text-base
  font-normal
  leading-5
`;

const ProductSalesContainer = tw.div`
  self-stretch
  flex
  flex-col
  gap-5
`;

const EmptyProductMessage = tw.div`
  text-center
  py-8
  text-[var(--fg-muted)]
  text-sm
`;

const ProductTabsRow = tw.div`
  self-stretch
  inline-flex
  justify-start
  items-start
  gap-1
`;

const ProductTabs = tw.div`
  flex-1
  flex
  justify-start
  items-center
  gap-1
`;

const ProductChip = tw.button<{ $selected: boolean }>`
  h-9
  px-3
  rounded-2xl
  flex
  justify-center
  items-center
  transition-colors
  ${({ $selected }) =>
    $selected
      ? 'bg-[var(--bg-neutral-solid)] text-[var(--fg-on-surface)]'
      : 'bg-[var(--bg-neutral)] outline outline-1 outline-offset-[-1px] text-[var(--fg-neutral)]'}
`;

const ProductChipLabel = tw.span`
  text-base
  font-normal
  leading-5
`;

const ExcelButton = tw.button`
  h-9
  min-w-9
  px-2
  bg-[var(--bg-neutral-subtle)]
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  flex
  justify-center
  items-center
  gap-1
  text-[var(--fg-neutral)]
`;

const ExcelButtonLabel = tw.span`
  px-1
  text-base
  font-medium
  leading-5
`;

const SettingCard = tw.div`
  self-stretch
  px-5
  bg-[var(--bg-neutral)]
  rounded-xl
  flex
  flex-col
  justify-start
  items-start
`;

const SettingRow = tw.div<{ $hasBorder: boolean }>`
  self-stretch
  h-20
  py-2
  inline-flex
  justify-start
  items-center
  gap-2
  ${({ $hasBorder }) =>
    $hasBorder ? 'border-b border-[var(--stroke-neutral)]' : ''}
`;

const SettingInfo = tw.div`
  flex-1
  inline-flex
  flex-col
  justify-center
  items-start
  gap-1
`;

const SettingTitle = tw.div`
  self-stretch
  text-[var(--fg-neutral)]
  text-base
  font-medium
  leading-5
`;

const SettingDescription = tw.div`
  self-stretch
  text-[var(--fg-muted)]
  text-sm
  font-normal
  leading-4
`;

const VisibilitySelect = tw.select`
  h-11
  px-3
  bg-[var(--bg-field)]
  border
  border-[var(--stroke-neutral)]
  rounded-lg
  text-[var(--fg-neutral)]
  text-base
  font-normal
  leading-5
  cursor-pointer
  outline-none
  focus:border-[var(--stroke-primary)]
`;

const ToggleSwitch = tw.div<{ $active: boolean }>`
  w-12
  h-7
  p-0.5
  rounded-[50px]
  flex
  items-start
  gap-2.5
  cursor-pointer
  transition-colors
  ${({ $active }) =>
    $active
      ? 'bg-[var(--bg-primary-solid)] justify-end'
      : 'bg-[var(--bg-neutral-solid)] justify-start'}
`;

const ToggleKnob = tw.div<{ $active: boolean }>`
  w-6
  h-6
  bg-[var(--fg-on-surface)]
  rounded-full
`;

const CommissionTableContainer = tw.div`
  self-stretch
  overflow-x-auto
  border
  border-[var(--stroke-neutral)]
  rounded-lg
`;

const Footer = tw.div`
  self-stretch
  inline-flex
  justify-start
  items-start
  gap-2
`;

const ConfirmButton = tw.button`
  h-11
  min-w-11
  px-4
  bg-[var(--bg-neutral-solid)]
  rounded-xl
  flex
  justify-center
  items-center
  text-[var(--fg-on-surface)]
  text-base
  font-medium
  leading-5
`;

const CancelButton = tw.button`
  h-11
  min-w-11
  px-4
  bg-[var(--bg-neutral)]
  rounded-xl
  flex
  justify-center
  items-center
  text-[var(--fg-neutral)]
  text-base
  font-medium
  leading-5
`;

/**
 * Usage:
 *
 * const handleOpenSalesSetting = async (influencer: CampaignInfluencerFormData, name: string) => {
 *   const result = await openInfluencerSalesSettingModal(influencer, name);
 *   if (result) {
 *     // 설정 저장 처리
 *     console.log('Updated settings:', result);
 *   }
 * };
 */
