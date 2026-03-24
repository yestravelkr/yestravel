/**
 * SalesInfoContent - 판매정보 탭 콘텐츠 컴포넌트
 *
 * 아코디언 UI로 판매자 정보를 표시합니다.
 * 문의하기 섹션과 판매자 정보 아코디언으로 구성됩니다.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

/** 판매자 정보 */
interface SellerInfo {
  /** 업체명 */
  companyName: string | null | undefined;
  /** 대표 */
  ceoName: string | null | undefined;
  /** 주소 */
  address: string | null | undefined;
  /** 사업자등록번호 */
  licenseNumber: string | null | undefined;
  /** 통신판매업번호 */
  mailOrderLicenseNumber: string | null | undefined;
}

// TODO: 호텔 숙박 정보 섹션 구현 시 사용
/** 숙소 정보 */
interface AccommodationInfo {
  /** 체크인 시간 */
  checkInTime: string | null | undefined;
  /** 체크아웃 시간 */
  checkOutTime: string | null | undefined;
  /** 기준 인원 */
  baseCapacity: number | null | undefined;
  /** 최대 인원 */
  maxCapacity: number | null | undefined;
  /** 침대 타입 목록 */
  bedTypes: string[] | null | undefined;
}

/** SalesInfoContent Props */
export interface SalesInfoContentProps {
  /** 판매 정보 */
  salesInfo: {
    seller: SellerInfo;
    accommodationInfo?: AccommodationInfo;
  };
}

/**
 * Usage:
 * <SalesInfoContent
 *   salesInfo={{
 *     seller: {
 *       companyName: "(주)신라호텔",
 *       ceoName: "이부진",
 *       address: "서울특별시 중구 동호로 249",
 *       licenseNumber: "123-45-67890",
 *       mailOrderLicenseNumber: "2024-서울중구-0001",
 *     },
 *   }}
 * />
 */
export function SalesInfoContent({ salesInfo }: SalesInfoContentProps) {
  const [isSellerOpen, setIsSellerOpen] = useState(true);

  return (
    <Container>
      {/* 문의하기 섹션 */}
      <InquirySection>
        <InquiryIconWrapper>
          <i className="iQuestion text-zinc-400 text-[48px]" />
        </InquiryIconWrapper>
        <InquiryTextGroup>
          <InquiryTitle>상품에 대해 궁금한 것이 있으신가요?</InquiryTitle>
          <InquiryDescription>
            상품 관련 문의는 판매자가 상세히 답변드려요.
            <br />
            문의하기 버튼을 눌러 문의해 주세요.
          </InquiryDescription>
        </InquiryTextGroup>
        <InquiryButton onClick={() => toast('문의하기 기능 준비 중입니다.')}>
          <InquiryButtonText>문의하기</InquiryButtonText>
        </InquiryButton>
      </InquirySection>

      {/* 구분선 */}
      <Divider />

      {/* 판매자 정보 아코디언 */}
      <AccordionSection>
        <AccordionHeader onClick={() => setIsSellerOpen(!isSellerOpen)}>
          <AccordionTitle>판매자 정보</AccordionTitle>
          <AccordionIconWrapper>
            <i className={isSellerOpen ? 'iArrowKeyUp' : 'iArrowKeyDown'} />
          </AccordionIconWrapper>
        </AccordionHeader>

        {isSellerOpen && (
          <AccordionContent>
            <InfoRow>
              <InfoLabel>업체명</InfoLabel>
              <InfoValueWrapper>
                <InfoValue>{salesInfo.seller.companyName ?? '-'}</InfoValue>
              </InfoValueWrapper>
            </InfoRow>
            <InfoRow>
              <InfoLabel>대표</InfoLabel>
              <InfoValueWrapper>
                <InfoValue>{salesInfo.seller.ceoName ?? '-'}</InfoValue>
              </InfoValueWrapper>
            </InfoRow>
            <InfoRow>
              <InfoLabel>주소</InfoLabel>
              <InfoValueWrapper>
                <InfoValue>{salesInfo.seller.address ?? '-'}</InfoValue>
              </InfoValueWrapper>
            </InfoRow>
            <InfoRow>
              <InfoLabel>사업자등록번호</InfoLabel>
              <InfoValueWrapper>
                <InfoValue>{salesInfo.seller.licenseNumber ?? '-'}</InfoValue>
              </InfoValueWrapper>
            </InfoRow>
            <InfoRow>
              <InfoLabel>통신판매업번호</InfoLabel>
              <InfoValueWrapper>
                <InfoValue>
                  {salesInfo.seller.mailOrderLicenseNumber ?? '-'}
                </InfoValue>
              </InfoValueWrapper>
            </InfoRow>
          </AccordionContent>
        )}
      </AccordionSection>
    </Container>
  );
}

// Styled Components

const Container = tw.div`
  self-stretch p-5 bg-white
  flex flex-col justify-start items-start gap-5
`;

const InquirySection = tw.div`
  self-stretch py-8
  flex flex-col justify-start items-center gap-5
`;

const InquiryIconWrapper = tw.div`
  w-[60px] h-[60px]
  flex items-center justify-center
`;

const InquiryTextGroup = tw.div`
  self-stretch
  flex flex-col justify-start items-start gap-2
`;

const InquiryTitle = tw.div`
  self-stretch text-center
  text-zinc-900 text-lg font-bold leading-6
`;

const InquiryDescription = tw.div`
  self-stretch text-center
  text-zinc-500 text-[15px] font-normal leading-5
`;

const InquiryButton = tw.button`
  h-11 px-4
  bg-zinc-900 rounded-xl
  inline-flex justify-center items-center
`;

const InquiryButtonText = tw.span`
  text-white text-base font-medium leading-[22px]
`;

const Divider = tw.div`
  self-stretch h-px bg-zinc-100
`;

const AccordionSection = tw.div`
  self-stretch bg-white
  flex flex-col justify-center items-start gap-5
`;

const AccordionHeader = tw.button`
  self-stretch
  inline-flex justify-between items-start
  cursor-pointer
`;

const AccordionTitle = tw.span`
  flex-1 text-left
  text-zinc-900 text-lg font-bold leading-6
`;

const AccordionIconWrapper = tw.div`
  w-6 h-6
  flex items-center justify-center
  text-zinc-400
`;

const AccordionContent = tw.div`
  self-stretch
  flex flex-col justify-start items-start gap-2
`;

const InfoRow = tw.div`
  self-stretch
  inline-flex justify-start items-start gap-2
`;

const InfoLabel = tw.div`
  w-[100px]
  text-zinc-500 text-[15px] font-normal leading-5
`;

const InfoValueWrapper = tw.div`
  flex-1
  inline-flex flex-col justify-center items-start gap-1
`;

const InfoValue = tw.div`
  self-stretch
  text-zinc-900 text-[15px] font-normal leading-5
`;
