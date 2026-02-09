/**
 * ConfirmModal - 확인 모달
 *
 * 사용자 확인이 필요한 작업 전에 표시하는 모달입니다.
 *
 * Usage:
 * const result = await openConfirmModal({
 *   title: '취소 요청',
 *   description: '선택한 상품의 취소를 요청합니다.',
 *   confirmText: '취소 요청',
 *   cancelText: '취소',
 * });
 * if (result) {
 *   // 확인 버튼 클릭 시 처리
 * }
 */

import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

export interface ConfirmModalProps {
  /** 모달 제목 */
  title: string;
  /** 모달 설명 */
  description: string;
  /** 확인 버튼 텍스트 */
  confirmText?: string;
  /** 취소 버튼 텍스트 */
  cancelText?: string;
}

function ConfirmModal({
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
}: ConfirmModalProps) {
  const { resolveModal } = useCurrentModal();

  const handleConfirm = () => {
    resolveModal(true);
  };

  const handleCancel = () => {
    resolveModal(false);
  };

  return (
    <Overlay onClick={handleCancel}>
      <ModalContainer onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <Content>
          <Title>{title}</Title>
          <Description>{description}</Description>
        </Content>
        <ButtonGroup>
          <ConfirmButton onClick={handleConfirm}>{confirmText}</ConfirmButton>
          <CancelButton onClick={handleCancel}>{cancelText}</CancelButton>
        </ButtonGroup>
      </ModalContainer>
    </Overlay>
  );
}

/**
 * 확인 모달을 여는 함수
 */
export function openConfirmModal(
  props: ConfirmModalProps
): Promise<boolean | null> {
  return SnappyModal.show(<ConfirmModal {...props} />, {
    position: 'center',
  });
}

// ============================================================================
// Styled Components
// ============================================================================

const Overlay = tw.div`
  fixed inset-0
  bg-black/40
  flex items-center justify-center
  z-50
  px-5
`;

const ModalContainer = tw.div`
  w-full max-w-[350px]
  bg-white
  rounded-2xl
  overflow-hidden
`;

const Content = tw.div`
  px-5 pt-6 pb-5
`;

const Title = tw.h2`
  text-lg font-bold leading-6
  text-fg-neutral
  mb-2
`;

const Description = tw.p`
  text-[15px] leading-5
  text-fg-neutral
`;

const ButtonGroup = tw.div`
  flex flex-col gap-2
  px-5 pb-5
`;

const ConfirmButton = tw.button`
  w-full h-[52px]
  bg-fg-neutral text-white
  rounded-xl
  font-medium text-[16.5px]
`;

const CancelButton = tw.button`
  w-full h-[52px]
  bg-white text-fg-neutral
  border border-stroke-neutral
  rounded-xl
  font-medium text-[16.5px]
`;
