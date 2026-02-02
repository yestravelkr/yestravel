/**
 * ConfirmModal - 확인 모달
 *
 * 사용자에게 확인/취소 액션을 요청하는 범용 모달입니다.
 */

import { Button } from '@yestravelkr/min-design-system';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

interface ConfirmModalProps {
  /** 모달 타이틀 (메시지) */
  title: string;
  /** 모달 설명 (서브 메시지) */
  description?: string;
  /** 확인 버튼 텍스트 (기본: 확인) */
  confirmText?: string;
  /** 취소 버튼 텍스트 (기본: 취소) */
  cancelText?: string;
}

export function ConfirmModal({
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
}: ConfirmModalProps) {
  const { resolveModal } = useCurrentModal();

  return (
    <Container>
      <Content>
        <Title>{title}</Title>
        {description && <Description>{description}</Description>}
      </Content>
      <ButtonGroup>
        <Button
          kind="neutral"
          variant="solid"
          size="large"
          className="w-full"
          onClick={() => resolveModal(true)}
        >
          {confirmText}
        </Button>
        <Button
          kind="muted"
          variant="solid"
          size="large"
          className="w-full"
          onClick={() => resolveModal(false)}
        >
          {cancelText}
        </Button>
      </ButtonGroup>
    </Container>
  );
}

export function openConfirmModal(
  props: ConfirmModalProps,
): Promise<boolean | null> {
  return SnappyModal.show(<ConfirmModal {...props} />, {
    position: 'center',
  });
}

// ========================================
// Styled Components
// ========================================

const Container = tw.div`
  w-[320px]
  p-3
  bg-white
  rounded-[20px]
  flex flex-col gap-5
`;

const Content = tw.div`
  flex flex-col gap-2
  px-2 py-3
`;

const Title = tw.p`
  text-lg font-bold
  text-[var(--fg-neutral,#18181b)]
  leading-6
`;

const Description = tw.p`
  text-[15px]
  text-[var(--fg-neutral,#18181B)]
  leading-5
  font-normal
`;

const ButtonGroup = tw.div`
  flex flex-col gap-2
`;

/**
 * Usage:
 *
 * const confirmed = await openConfirmModal({
 *   title: '예약대기 상태로 변경됩니다.',
 * });
 *
 * if (confirmed) {
 *   // 확인 액션 실행
 * }
 *
 * // 커스텀 버튼 텍스트
 * const confirmed = await openConfirmModal({
 *   title: '주문을 취소하시겠습니까?',
 *   confirmText: '취소하기',
 *   cancelText: '돌아가기',
 * });
 */
