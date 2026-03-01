/**
 * FormPageLayout - 폼 기반 상세 페이지 레이아웃
 *
 * 브랜드 생성/수정 등 1컬럼 중앙 정렬 폼 페이지용 공통 레이아웃
 * Container, Header, Content, Cards로 구성
 *
 * Usage:
 * ```tsx
 * <FormPageLayout.Container>
 *   <form onSubmit={handleSubmit}>
 *     <FormPageLayout.Content>
 *       <FormPageLayout.Header title="새 브랜드" onBack={handleBack}>
 *         <SaveButton type="submit">저장</SaveButton>
 *       </FormPageLayout.Header>
 *       <FormPageLayout.Cards>
 *         <Card title="기본정보">...</Card>
 *         <Card title="사업자정보">...</Card>
 *       </FormPageLayout.Cards>
 *     </FormPageLayout.Content>
 *   </form>
 * </FormPageLayout.Container>
 * ```
 */

import { ArrowLeft } from 'lucide-react';
import tw from 'tailwind-styled-components';

// ============================================
// Container - 페이지 외부 컨테이너
// ============================================

interface ContainerProps {
  children: React.ReactNode;
}

function Container({ children }: ContainerProps) {
  return <StyledContainer>{children}</StyledContainer>;
}

const StyledContainer = tw.div`
  flex flex-col items-center
  p-6
  min-h-full
  bg-[var(--bg-layer-base)]
`;

// ============================================
// Content - 내용 래퍼 (width, gap 관리)
// ============================================

interface ContentProps {
  children: React.ReactNode;
}

function Content({ children }: ContentProps) {
  return <StyledContent>{children}</StyledContent>;
}

const StyledContent = tw.div`
  flex flex-col
  gap-8
  w-[860px]
`;

// ============================================
// Header - 페이지 헤더 (뒤로가기 + 타이틀 + 액션)
// ============================================

interface HeaderProps {
  /** 페이지 타이틀 */
  title: string;
  /** 뒤로가기 클릭 핸들러 */
  onBack: () => void;
  /** 액션 버튼들 (저장, 수정, 취소 등) */
  children?: React.ReactNode;
}

function Header({ title, onBack, children }: HeaderProps) {
  return (
    <StyledHeader>
      <BackButton type="button" onClick={onBack}>
        <ArrowLeft size={20} />
      </BackButton>
      <Title>{title}</Title>
      {children}
    </StyledHeader>
  );
}

const StyledHeader = tw.div`
  flex items-center
  gap-3
`;

const BackButton = tw.button`
  flex items-center justify-center
  size-11
  bg-white
  border border-[var(--stroke-neutral,#E4E4E7)]
  rounded-full
  text-[var(--fg-neutral,#18181B)]
  cursor-pointer
  transition-colors
  hover:bg-[var(--bg-neutral,#F4F4F5)]
`;

const Title = tw.h1`
  flex-1
  text-[27px]
  font-bold
  leading-9
  text-[var(--fg-neutral,#18181B)]
`;

// ============================================
// Cards - 카드 영역 컨테이너
// ============================================

interface CardsProps {
  children: React.ReactNode;
}

function Cards({ children }: CardsProps) {
  return <StyledCards>{children}</StyledCards>;
}

const StyledCards = tw.div`
  flex flex-col
  gap-5
`;

// ============================================
// 공통 버튼 스타일 (선택적으로 export)
// ============================================

export const FormPageButton = tw.button`
  flex items-center justify-center
  h-11
  min-w-11
  px-4
  rounded-xl
  font-medium
  text-[16.5px]
  leading-[22px]
  cursor-pointer
  transition-colors
  disabled:opacity-50
  disabled:cursor-not-allowed
`;

export const PrimaryButton = tw(FormPageButton)`
  bg-[var(--bg-neutral-solid,#18181B)]
  text-white
  hover:bg-[#2D2D2D]
`;

export const SecondaryButton = tw(FormPageButton)`
  bg-white
  border border-[var(--stroke-neutral,#E4E4E7)]
  text-[var(--fg-neutral,#18181B)]
  hover:bg-[var(--bg-neutral,#F4F4F5)]
`;

export const ButtonGroup = tw.div`
  flex items-center gap-2
`;

// ============================================
// Compound Component Export
// ============================================

export const FormPageLayout = {
  Container,
  Content,
  Header,
  Cards,
};
