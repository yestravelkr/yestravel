/**
 * DeleteConfirmModal - 삭제 확인 모달
 *
 * 삭제 작업 전 사용자에게 확인을 요청하는 모달입니다.
 */

import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

interface DeleteConfirmModalProps {
  /** 삭제 대상 이름 (예: "브랜드", "상품") */
  targetName: string;
  /** 추가 설명 메시지 (선택) */
  description?: string;
}

export function DeleteConfirmModal({
  targetName,
  description,
}: DeleteConfirmModalProps) {
  const { resolveModal } = useCurrentModal();

  const handleDelete = () => {
    resolveModal(true);
  };

  const handleCancel = () => {
    resolveModal(false);
  };

  return (
    <Container>
      <Content>
        <Title>선택한 {targetName}을(를) 삭제할까요?</Title>
        {description && <Description>{description}</Description>}
      </Content>
      <ButtonGroup>
        <DeleteButton onClick={handleDelete}>삭제</DeleteButton>
        <CancelButton onClick={handleCancel}>취소</CancelButton>
      </ButtonGroup>
    </Container>
  );
}

export function openDeleteConfirmModal(
  props: DeleteConfirmModalProps,
): Promise<boolean | null> {
  return SnappyModal.show(<DeleteConfirmModal {...props} />, {
    position: 'center',
  });
}

const Container = tw.div`
  w-[320px]
  p-3
  bg-white
  rounded-[20px]
  flex
  flex-col
  gap-5
`;

const Content = tw.div`
  flex
  flex-col
  gap-2
  px-2
  py-3
`;

const Title = tw.p`
  text-lg
  font-bold
  text-[var(--fg-neutral)]
  leading-6
`;

const Description = tw.p`
  text-[15px]
  font-normal
  text-[var(--fg-neutral)]
  leading-5
`;

const ButtonGroup = tw.div`
  flex
  flex-col
  gap-2
`;

const DeleteButton = tw.button`
  h-11
  px-3
  bg-[var(--bg-critical-solid,#eb3d3d)]
  rounded-xl
  flex
  justify-center
  items-center
  text-white
  text-[16.5px]
  font-medium
  leading-[22px]
  cursor-pointer
  hover:opacity-90
  transition-opacity
`;

const CancelButton = tw.button`
  h-11
  px-3
  bg-[var(--bg-neutral,#f4f4f5)]
  rounded-xl
  flex
  justify-center
  items-center
  text-[var(--fg-neutral,#18181b)]
  text-[16.5px]
  font-medium
  leading-[22px]
  cursor-pointer
  hover:opacity-90
  transition-opacity
`;

/**
 * Usage:
 *
 * const confirmed = await openDeleteConfirmModal({
 *   targetName: '브랜드',
 *   description: '삭제된 브랜드는 복구할 수 없습니다.',
 * });
 *
 * if (confirmed) {
 *   // 삭제 실행
 * }
 */
