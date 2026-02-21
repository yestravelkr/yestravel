import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import tw from 'tailwind-styled-components';

import type { ContactModalProps } from '../constants';

/**
 * ContactBar - 하단 고정 제휴 문의 바 (모바일: 버튼 + 모달, 데스크톱: 인라인 폼)
 */
export function ContactBar() {
  const [brandName, setBrandName] = useState('');
  const [contact, setContact] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ContactBarWrapper>
        {/* Mobile/Tablet: 문의 버튼 */}
        <ContactBarMobile>
          <ContactBarMobileButton onClick={() => setIsModalOpen(true)}>
            <MessageCircle className="size-5 shrink-0" />
            <span>제휴 문의하기</span>
          </ContactBarMobileButton>
          <ContactBarMobileDesc>
            문의 남겨주시면 인플루언서 리스트를 보내드립니다.
          </ContactBarMobileDesc>
        </ContactBarMobile>

        {/* Desktop: 인라인 폼 */}
        <ContactBarDesktop>
          <ContactBarInfo>
            <MessageCircle className="size-6 shrink-0" />
            <div className="flex flex-col">
              <ContactBarTitle>제휴 문의</ContactBarTitle>
              <ContactBarDesc>
                문의 남겨주시면 인플루언서 리스트를 보내드립니다.
              </ContactBarDesc>
            </div>
          </ContactBarInfo>
          <ContactBarForm>
            <ContactInput
              type="text"
              placeholder="브랜드/업체명"
              value={brandName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setBrandName(e.target.value)
              }
            />
            <ContactInput
              type="text"
              placeholder="연락처"
              value={contact}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setContact(e.target.value)
              }
            />
            <ContactSubmitButton>무료 상담 신청</ContactSubmitButton>
          </ContactBarForm>
        </ContactBarDesktop>
      </ContactBarWrapper>

      {/* Mobile Modal */}
      <ContactModal
        $isOpen={isModalOpen}
        brandName={brandName}
        contact={contact}
        onBrandNameChange={setBrandName}
        onContactChange={setContact}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

/**
 * ContactModal - 모바일 전용 바텀 시트 문의 모달
 */
function ContactModal({
  $isOpen,
  brandName,
  contact,
  onBrandNameChange,
  onContactChange,
  onClose,
}: ContactModalProps) {
  if (!$isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <ModalTitle>제휴 문의</ModalTitle>
        <ModalDesc>문의 남겨주시면 인플루언서 리스트를 보내드립니다.</ModalDesc>
        <ModalFormGroup>
          <ModalInput
            type="text"
            placeholder="브랜드/업체명"
            value={brandName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onBrandNameChange(e.target.value)
            }
          />
          <ModalInput
            type="text"
            placeholder="연락처"
            value={contact}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onContactChange(e.target.value)
            }
          />
          <ModalSubmitButton>무료 상담 신청</ModalSubmitButton>
        </ModalFormGroup>
      </ModalCard>
    </ModalOverlay>
  );
}

// --- Styled Components ---

const ContactBarWrapper = tw.div`
  fixed bottom-0 left-0 right-0 z-50
  bg-white border-t border-[#e4e4e7]
  px-4 tablet:px-5 lg:px-[120px]
  py-3 lg:py-4
`;

// Mobile/Tablet
const ContactBarMobile = tw.div`
  flex flex-col items-center gap-2
  lg:hidden
`;

const ContactBarMobileButton = tw.button`
  w-full h-[48px]
  flex items-center justify-center gap-2
  rounded-xl
  bg-[#18181b] text-white
  font-semibold text-[15px]
  cursor-pointer
`;

const ContactBarMobileDesc = tw.p`
  font-normal text-[13px] leading-4
  text-[#71717a]
`;

// Desktop
const ContactBarDesktop = tw.div`
  hidden lg:flex
  w-full max-w-[1200px] mx-auto
  items-center justify-between
  gap-4
`;

const ContactBarInfo = tw.div`
  flex items-center gap-3
`;

const ContactBarTitle = tw.p`
  font-bold text-[16px] leading-5
  text-[#18181b]
`;

const ContactBarDesc = tw.p`
  font-normal text-[13px] leading-4
  text-[#71717a]
`;

const ContactBarForm = tw.div`
  flex items-center gap-2
`;

const ContactInput = tw.input`
  h-[44px] w-[160px]
  px-3 rounded-xl
  border border-[#e4e4e7]
  bg-white
  text-sm text-[#18181b]
  placeholder:text-[#a1a1aa]
  outline-none
  focus:border-[#18181b]
`;

const ContactSubmitButton = tw.button`
  h-[44px] px-6
  rounded-xl
  bg-[#18181b] text-white
  font-semibold text-sm
  whitespace-nowrap
  cursor-pointer
  hover:bg-[#27272a]
  transition-colors
`;

// Modal (Mobile bottom sheet)
const ModalOverlay = tw.div`
  fixed inset-0 z-[60]
  bg-black/50
  flex items-end justify-center
  lg:hidden
`;

const ModalCard = tw.div`
  w-full
  bg-white
  rounded-t-2xl
  px-5 pt-8 pb-8
  flex flex-col gap-4
`;

const ModalTitle = tw.p`
  font-bold text-[18px] leading-6
  text-[#18181b]
`;

const ModalDesc = tw.p`
  font-normal text-[14px] leading-5
  text-[#71717a]
`;

const ModalFormGroup = tw.div`
  flex flex-col gap-3
  mt-2
`;

const ModalInput = tw.input`
  h-[48px] w-full
  px-4 rounded-xl
  border border-[#e4e4e7]
  bg-white
  text-sm text-[#18181b]
  placeholder:text-[#a1a1aa]
  outline-none
  focus:border-[#18181b]
`;

const ModalSubmitButton = tw.button`
  h-[48px] w-full
  rounded-xl
  bg-[#18181b] text-white
  font-semibold text-[15px]
  cursor-pointer
  hover:bg-[#27272a]
  transition-colors
  mt-1
`;
