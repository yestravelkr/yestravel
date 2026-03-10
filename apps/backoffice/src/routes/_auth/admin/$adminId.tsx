import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { ROLE_VALUES, ROLE_LABELS } from '@/constants/role';
import { trpc } from '@/shared/trpc';

export const Route = createFileRoute('/_auth/admin/$adminId')({
  component: AdminDetailPage,
});

function AdminDetailPage() {
  const { adminId } = Route.useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const { data: admin, isLoading } = trpc.backofficeAdmin.findById.useQuery({
    id: Number(adminId),
  });

  const updateAdminMutation = trpc.backofficeAdmin.update.useMutation({
    onSuccess: () => {
      toast.success('관리자 정보가 수정되었습니다.');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message || '수정 중 오류가 발생했습니다.');
    },
  });

  const updatePasswordMutation =
    trpc.backofficeAdmin.updatePassword.useMutation({
      onSuccess: () => {
        toast.success('비밀번호가 변경되었습니다.');
        setShowPasswordModal(false);
      },
      onError: (error) => {
        toast.error(error.message || '비밀번호 변경 중 오류가 발생했습니다.');
      },
    });

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    role: '',
  });

  const [newPassword, setNewPassword] = useState('');

  if (isLoading) {
    return <LoadingContainer>로딩 중...</LoadingContainer>;
  }

  if (!admin) {
    return <ErrorContainer>관리자를 찾을 수 없습니다.</ErrorContainer>;
  }

  const handleEdit = () => {
    setFormData({
      name: admin.name,
      phoneNumber: admin.phoneNumber,
      role: admin.role,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateAdminMutation.mutate({
      id: Number(adminId),
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      role: formData.role as any,
    });
  };

  const handlePasswordChange = () => {
    if (newPassword.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    updatePasswordMutation.mutate({
      id: Number(adminId),
      newPassword,
    });
  };

  const getRoleLabel = (role: string) => {
    return ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role;
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate({ to: '/admin' })}>
          ← 목록으로
        </BackButton>
        <Title>관리자 상세 정보</Title>
      </Header>

      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          {!isEditing && <EditButton onClick={handleEdit}>수정</EditButton>}
        </CardHeader>

        <CardContent>
          <InfoGrid>
            <InfoItem>
              <Label>이메일</Label>
              <Value>{admin.email}</Value>
            </InfoItem>

            <InfoItem>
              <Label>이름</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              ) : (
                <Value>{admin.name}</Value>
              )}
            </InfoItem>

            <InfoItem>
              <Label>전화번호</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              ) : (
                <Value>{admin.phoneNumber}</Value>
              )}
            </InfoItem>

            <InfoItem>
              <Label>권한</Label>
              {isEditing ? (
                <Select
                  value={formData.role}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value={ROLE_VALUES.ADMIN_SUPER}>
                    {ROLE_LABELS[ROLE_VALUES.ADMIN_SUPER]}
                  </option>
                  <option value={ROLE_VALUES.ADMIN_STAFF}>
                    {ROLE_LABELS[ROLE_VALUES.ADMIN_STAFF]}
                  </option>
                </Select>
              ) : (
                <RoleBadge>{getRoleLabel(admin.role)}</RoleBadge>
              )}
            </InfoItem>

            <InfoItem>
              <Label>등록일</Label>
              <Value>
                {new Date(admin.createdAt).toLocaleDateString('ko-KR')}
              </Value>
            </InfoItem>
          </InfoGrid>

          {isEditing && (
            <ButtonGroup>
              <CancelButton onClick={() => setIsEditing(false)}>
                취소
              </CancelButton>
              <SaveButton onClick={handleSave}>저장</SaveButton>
            </ButtonGroup>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>보안 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <SecuritySection>
            <SecurityItem>
              <div>
                <SecurityLabel>비밀번호</SecurityLabel>
                <SecurityDescription>
                  관리자의 로그인 비밀번호를 변경합니다.
                </SecurityDescription>
              </div>
              <ChangePasswordButton onClick={() => setShowPasswordModal(true)}>
                비밀번호 변경
              </ChangePasswordButton>
            </SecurityItem>
          </SecuritySection>
        </CardContent>
      </Card>

      {showPasswordModal && (
        <Modal>
          <ModalBackdrop onClick={() => setShowPasswordModal(false)} />
          <ModalContent>
            <ModalTitle>비밀번호 변경</ModalTitle>
            <ModalBody>
              <Label>새 비밀번호</Label>
              <Input
                type="password"
                placeholder="최소 6자 이상"
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewPassword(e.target.value)
                }
              />
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={() => setShowPasswordModal(false)}>
                취소
              </CancelButton>
              <SaveButton onClick={handlePasswordChange}>변경</SaveButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

const Container = tw.div`
  p-6
  max-w-4xl
  mx-auto
`;

const Header = tw.div`
  mb-6
`;

const BackButton = tw.button`
  text-gray-600
  hover:text-gray-900
  mb-4
`;

const Title = tw.h1`
  text-2xl
  font-bold
  text-gray-900
`;

const Card = tw.div`
  bg-white
  rounded-lg
  shadow
  mb-6
`;

const CardHeader = tw.div`
  px-6
  py-4
  border-b
  border-gray-200
  flex
  justify-between
  items-center
`;

const CardTitle = tw.h2`
  text-lg
  font-semibold
  text-gray-900
`;

const EditButton = tw.button`
  px-4
  py-2
  text-sm
  font-medium
  text-blue-600
  hover:text-blue-700
`;

const CardContent = tw.div`
  p-6
`;

const InfoGrid = tw.div`
  grid
  grid-cols-2
  gap-6
`;

const InfoItem = tw.div``;

const Label = tw.div`
  text-sm
  font-medium
  text-gray-500
  mb-1
`;

const Value = tw.div`
  text-gray-900
`;

const Input = tw.input`
  w-full
  px-3
  py-2
  border
  border-gray-300
  rounded-md
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
`;

const Select = tw.select`
  w-full
  px-3
  py-2
  border
  border-gray-300
  rounded-md
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
`;

const RoleBadge = tw.span`
  inline-flex
  items-center
  px-3
  py-1
  rounded-full
  text-sm
  font-medium
  bg-blue-100
  text-blue-800
`;

const ButtonGroup = tw.div`
  flex
  gap-3
  mt-6
  justify-end
`;

const SaveButton = tw.button`
  px-4
  py-2
  bg-blue-600
  text-white
  rounded-lg
  hover:bg-blue-700
  transition-colors
  font-medium
`;

const CancelButton = tw.button`
  px-4
  py-2
  border
  border-gray-300
  text-gray-700
  rounded-lg
  hover:bg-gray-50
  transition-colors
  font-medium
`;

const SecuritySection = tw.div`
  space-y-4
`;

const SecurityItem = tw.div`
  flex
  justify-between
  items-center
`;

const SecurityLabel = tw.div`
  font-medium
  text-gray-900
`;

const SecurityDescription = tw.div`
  text-sm
  text-gray-500
  mt-1
`;

const ChangePasswordButton = tw.button`
  px-4
  py-2
  text-sm
  font-medium
  text-blue-600
  border
  border-blue-600
  rounded-lg
  hover:bg-blue-50
  transition-colors
`;

const LoadingContainer = tw.div`
  p-6
  text-center
  text-gray-500
`;

const ErrorContainer = tw.div`
  p-6
  text-center
  text-red-600
`;

const Modal = tw.div`
  fixed
  inset-0
  z-50
  flex
  items-center
  justify-center
`;

const ModalBackdrop = tw.div`
  absolute
  inset-0
  bg-black
  bg-opacity-50
`;

const ModalContent = tw.div`
  relative
  bg-white
  rounded-lg
  shadow-xl
  w-full
  max-w-md
  p-6
`;

const ModalTitle = tw.h3`
  text-lg
  font-semibold
  text-gray-900
  mb-4
`;

const ModalBody = tw.div`
  space-y-4
`;

const ModalFooter = tw.div`
  flex
  gap-3
  mt-6
  justify-end
`;
