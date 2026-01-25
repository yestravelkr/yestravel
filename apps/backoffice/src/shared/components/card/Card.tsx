/**
 * Card - 카드 컴포넌트
 *
 * 섹션을 감싸는 흰색 카드 컴포넌트
 */

import tw from 'tailwind-styled-components';

interface CardProps {
  /** 카드 제목 */
  title?: string;
  /** 카드 내용 */
  children: React.ReactNode;
  /** 추가 클래스 */
  className?: string;
}

/**
 * Usage:
 * ```tsx
 * <Card title="결제정보">
 *   <DescriptionList items={...} />
 * </Card>
 * ```
 */
export function Card({ title, children, className }: CardProps) {
  return (
    <Container className={className}>
      {title && <Title>{title}</Title>}
      {children}
    </Container>
  );
}

const Container = tw.div`
  bg-[var(--bg-layer,#FFF)]
  rounded-[20px]
  p-5
  flex
  flex-col
  gap-5
`;

const Title = tw.h3`
  text-[21px]
  font-bold
  leading-7
  text-[var(--fg-neutral)]
  h-9
  flex
  items-center
`;
