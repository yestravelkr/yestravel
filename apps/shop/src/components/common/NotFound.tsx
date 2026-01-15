/**
 * NotFound - 404 페이지 컴포넌트
 *
 * 존재하지 않는 페이지에 접근했을 때 표시되는 컴포넌트입니다.
 *
 * Usage:
 * <NotFound />
 */

import { useNavigate } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import { Button } from './Button';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <Container>
      <Content>
        <ErrorCode>404</ErrorCode>
        <Title>페이지를 찾을 수 없습니다</Title>
        <Description>
          요청하신 페이지가 존재하지 않거나
          <br />
          이동되었을 수 있습니다.
        </Description>
        <ButtonWrapper>
          <Button onClick={() => navigate({ to: '/' })}>홈으로 돌아가기</Button>
        </ButtonWrapper>
      </Content>
    </Container>
  );
}

// Styled Components
const Container = tw.div`
  min-h-screen
  bg-white
  max-w-[600px]
  mx-auto
  flex
  items-center
  justify-center
  px-5
`;

const Content = tw.div`
  flex
  flex-col
  items-center
  text-center
`;

const ErrorCode = tw.div`
  text-[80px]
  font-bold
  text-fg-disabled
  leading-none
  mb-4
`;

const Title = tw.h1`
  text-xl
  font-bold
  text-fg-neutral
  mb-2
`;

const Description = tw.p`
  text-sm
  text-fg-subtle
  leading-5
  mb-8
`;

const ButtonWrapper = tw.div`
  w-[200px]
`;
