import { Minus, Plus } from 'lucide-react';
import tw from 'tailwind-styled-components';

import type { FaqSectionProps } from '../constants';
import { FAQ_ITEMS } from '../constants';

/**
 * FaqSection - 자주 묻는 질문 아코디언 영역
 */
export function FaqSection({ openIndex, onToggle }: FaqSectionProps) {
  return (
    <FaqWrapper>
      <FaqTitle>자주 묻는 질문</FaqTitle>
      <FaqList>
        {FAQ_ITEMS.map((item, i) => (
          <FaqItemWrapper key={i}>
            <FaqDivider />
            <FaqQuestionRow onClick={() => onToggle(openIndex === i ? -1 : i)}>
              <FaqQuestion>{item.question}</FaqQuestion>
              {openIndex === i ? (
                <Minus className="size-6 shrink-0" />
              ) : (
                <Plus className="size-6 shrink-0" />
              )}
            </FaqQuestionRow>
            {openIndex === i && <FaqAnswer>{item.answer}</FaqAnswer>}
          </FaqItemWrapper>
        ))}
        <FaqDivider />
      </FaqList>
    </FaqWrapper>
  );
}

// --- Styled Components ---

const FaqWrapper = tw.section`
  w-full
  px-4 tablet:px-5 lg:px-[120px]
  py-12 tablet:py-16 lg:py-16
  bg-white overflow-clip
  flex flex-col items-center justify-center gap-8
`;

const FaqTitle = tw.h2`
  w-full text-center
  font-bold text-[27px] leading-[36px]
  text-[#18181b]
`;

const FaqList = tw.div`
  w-full lg:w-[820px]
  flex flex-col items-start gap-8
`;

const FaqDivider = tw.div`
  w-full h-[2px] bg-[#18181b]
`;

const FaqItemWrapper = tw.div`
  w-full flex flex-col items-start gap-5
`;

const FaqQuestionRow = tw.button`
  w-full flex items-start gap-2
  cursor-pointer
`;

const FaqQuestion = tw.p`
  flex-1 min-w-0 text-left
  font-bold text-[21px] leading-7
  text-[#18181b]
`;

const FaqAnswer = tw.p`
  w-full font-normal text-[16.5px] leading-[22px]
  text-[#18181b]
`;
