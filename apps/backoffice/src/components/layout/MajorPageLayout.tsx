import tw from 'tailwind-styled-components';

/**
 * MajorPageLayout
 *
 * 백오피스의 주요 페이지들(품목, 캠페인, 브랜드 등)에서 공통으로 사용되는 레이아웃 컴포넌트
 *
 * 구성 요소:
 * - Container: 전체 페이지 컨테이너 (패딩 포함)
 * - Header: 페이지 제목과 설명을 포함하는 상단 영역
 * - Title: 페이지 메인 제목
 * - Description: 페이지 설명 텍스트
 * - Content: 메인 콘텐츠 영역 (흰색 배경, 그림자, 테두리)
 *
 * 사용 예시:
 * <MajorPageLayout
 *   title="품목 관리"
 *   description="상품 품목을 관리할 수 있습니다."
 *   headerActions={<button>액션 버튼</button>}
 * >
 *   <div>페이지 콘텐츠</div>
 * </MajorPageLayout>
 */

interface MajorPageLayoutProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  headerActions?: React.ReactNode; // 헤더에 추가할 액션 버튼들
}

export function MajorPageLayout({
  title,
  description,
  children,
  headerActions,
}: MajorPageLayoutProps) {
  return (
    <Container>
      <Header $hasActions={!!headerActions}>
        <HeaderContent>
          <Title>{title}</Title>
          {description && <Description>{description}</Description>}
        </HeaderContent>
        {headerActions && <HeaderActions>{headerActions}</HeaderActions>}
      </Header>

      <Content>{children}</Content>
    </Container>
  );
}

// 전체 페이지 컨테이너 - 기본 패딩 적용
const Container = tw.div`
  p-6
  bg-[var(--bg-layer-base,#F4F4F5)]
`;

// 페이지 헤더 영역 - 제목과 설명을 포함, 액션 버튼이 있으면 플렉스 레이아웃
const Header = tw.div<{ $hasActions: boolean }>`
  ${({ $hasActions }) => ($hasActions ? 'flex justify-between items-center' : '')}
  mb-8
`;

// 헤더 콘텐츠 - 제목과 설명을 묶는 컨테이너
const HeaderContent = tw.div``;

// 헤더 액션 영역 - 버튼 등을 배치
const HeaderActions = tw.div``;

// 페이지 메인 제목 - 큰 폰트, 굵은 글씨
const Title = tw.h1`
  text-2xl
  font-bold
  text-gray-900
  mb-2
`;

// 페이지 설명 텍스트 - 회색 톤
const Description = tw.p`
  text-gray-600
`;

// 메인 콘텐츠 영역 - 평면형 단순 컨테이너
const Content = tw.div``;
