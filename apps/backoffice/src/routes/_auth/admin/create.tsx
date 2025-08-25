import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import tw from 'tailwind-styled-components';

import { ROLE_VALUES, ROLE_LABELS } from '@/constants/role';
import { trpc } from '@/shared/trpc';

export const Route = createFileRoute('/_auth/admin/create')({
  component: AdminCreatePage,
});

function AdminCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phoneNumber: '',
    role: ROLE_VALUES.ADMIN_STAFF,
  });

  const createAdminMutation = trpc.backofficeAdmin.create.useMutation({
    onSuccess: () => {
      toast.success('관리자가 성공적으로 추가되었습니다.');
      navigate({ to: '/admin' });
    },
    onError: (error) => {
      toast.error(error.message || '관리자 추가 중 오류가 발생했습니다.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (
      !formData.email ||
      !formData.password ||
      !formData.name ||
      !formData.phoneNumber
    ) {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    createAdminMutation.mutate({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      role: formData.role as any,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate({ to: '/admin' })}>
          ← 목록으로
        </BackButton>
        <Title>새 관리자 추가</Title>
      </Header>

      <FormCard>
        <Form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>계정 정보</SectionTitle>

            <FormGrid>
              <FormGroup>
                <Label htmlFor="email">
                  이메일 <Required>*</Required>
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="role">
                  권한 <Required>*</Required>
                </Label>
                <Select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value={ROLE_VALUES.ADMIN_SUPER}>
                    {ROLE_LABELS[ROLE_VALUES.ADMIN_SUPER]}
                  </option>
                  <option value={ROLE_VALUES.ADMIN_STAFF}>
                    {ROLE_LABELS[ROLE_VALUES.ADMIN_STAFF]}
                  </option>
                  <option value={ROLE_VALUES.PARTNER_SUPER}>
                    {ROLE_LABELS[ROLE_VALUES.PARTNER_SUPER]}
                  </option>
                  <option value={ROLE_VALUES.PARTNER_STAFF}>
                    {ROLE_LABELS[ROLE_VALUES.PARTNER_STAFF]}
                  </option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="password">
                  비밀번호 <Required>*</Required>
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="최소 6자 이상"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="passwordConfirm">
                  비밀번호 확인 <Required>*</Required>
                </Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          <FormSection>
            <SectionTitle>기본 정보</SectionTitle>

            <FormGrid>
              <FormGroup>
                <Label htmlFor="name">
                  이름 <Required>*</Required>
                </Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="홍길동"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="phoneNumber">
                  전화번호 <Required>*</Required>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="010-1234-5678"
                  required
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          <FormActions>
            <CancelButton
              type="button"
              onClick={() => navigate({ to: '/admin' })}
            >
              취소
            </CancelButton>
            <SubmitButton
              type="submit"
              disabled={createAdminMutation.isPending}
            >
              {createAdminMutation.isPending ? '추가 중...' : '관리자 추가'}
            </SubmitButton>
          </FormActions>
        </Form>
      </FormCard>
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

const FormCard = tw.div`
  bg-white
  rounded-lg
  shadow
`;

const Form = tw.form`
  p-6
`;

const FormSection = tw.div`
  mb-8
`;

const SectionTitle = tw.h2`
  text-lg
  font-semibold
  text-gray-900
  mb-4
  pb-2
  border-b
  border-gray-200
`;

const FormGrid = tw.div`
  grid
  grid-cols-2
  gap-6
`;

const FormGroup = tw.div``;

const Label = tw.label`
  block
  text-sm
  font-medium
  text-gray-700
  mb-1
`;

const Required = tw.span`
  text-red-500
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
  focus:border-transparent
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
  focus:border-transparent
`;

const FormActions = tw.div`
  flex
  justify-end
  gap-3
  pt-6
  border-t
  border-gray-200
`;

const CancelButton = tw.button`
  px-6
  py-2
  border
  border-gray-300
  text-gray-700
  rounded-lg
  hover:bg-gray-50
  transition-colors
  font-medium
`;

const SubmitButton = tw.button`
  px-6
  py-2
  bg-blue-600
  text-white
  rounded-lg
  hover:bg-blue-700
  transition-colors
  font-medium
  disabled:bg-gray-400
  disabled:cursor-not-allowed
`;
