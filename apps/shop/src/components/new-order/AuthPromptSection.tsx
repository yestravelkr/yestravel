/**
 * AuthPromptSection - 미로그인 상태 인증 안내 섹션
 *
 * 미로그인 사용자에게 인증/로그인을 유도하는 안내 메시지와 버튼을 표시합니다.
 *
 * Usage:
 * <AuthPromptSection onAuthClick={() => openLoginBottomSheet()} />
 */

import tw from 'tailwind-styled-components';

import { Button } from '@/components/common/Button';

export interface AuthPromptSectionProps {
  /** 인증하기 버튼 클릭 핸들러 */
  onAuthClick: () => void;
}

export function AuthPromptSection({ onAuthClick }: AuthPromptSectionProps) {
  return (
    <Section>
      <Message>
        연락처 인증 또는 로그인 후
        <br />
        주문을 진행해 주세요.
      </Message>
      <Button onClick={onAuthClick}>인증하기</Button>
    </Section>
  );
}

const Section = tw.section`
  p-5
  bg-white
  flex
  flex-col
  gap-4
`;

const Message = tw.p`
  text-fg-neutral
  text-[21px]
  font-bold
  leading-7
`;
