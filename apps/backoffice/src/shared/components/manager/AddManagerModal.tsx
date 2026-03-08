/**
 * AddManagerModal - 관리자 추가 모달
 *
 * 파트너(브랜드/인플루언서)에 새로운 관리자를 추가하는 모달입니다.
 * react-snappy-modal 패턴을 사용합니다.
 */

import { type ChangeEvent, useState } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

import { ROLE_VALUES, type RoleType } from '@/constants/role';
import { SelectDropdown } from '@/shared/components/SelectDropdown';

export interface AddManagerInput {
  /** 이메일 */
  email: string;
  /** 비밀번호 */
  password: string;
  /** 이름 */
  name: string;
  /** 연락처 */
  phoneNumber: string;
  /** 역할 */
  role: RoleType;
}

const roleOptions = [
  { value: ROLE_VALUES.PARTNER_SUPER, label: '대표 관리자' },
  { value: ROLE_VALUES.PARTNER_STAFF, label: '관리자' },
];

/**
 * Usage:
 * ```tsx
 * const result = await openAddManagerModal();
 * if (result) {
 *   createManager(result);
 * }
 * ```
 */
export function AddManagerModal() {
  const { resolveModal } = useCurrentModal();

  const [form, setForm] = useState<AddManagerInput>({
    email: '',
    password: '',
    name: '',
    phoneNumber: '',
    role: ROLE_VALUES.PARTNER_STAFF,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof AddManagerInput, string>>
  >({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AddManagerInput, string>> = {};

    if (!form.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    }
    if (!form.password || form.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }
    if (!form.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }
    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = '연락처를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      resolveModal(form);
    }
  };

  const handleCancel = () => {
    resolveModal(null);
  };

  const updateField = (
    field: Exclude<keyof AddManagerInput, 'role'>,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const updateRole = (value: string) => {
    setForm((prev) => ({ ...prev, role: value as RoleType }));
  };

  return (
    <Container>
      <Title>관리자 추가</Title>

      <FieldGroup>
        <FieldWrapper>
          <FieldLabel>이메일</FieldLabel>
          <StyledInput
            type="email"
            value={form.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateField('email', e)
            }
            placeholder="이메일을 입력하세요"
            $error={!!errors.email}
          />
          {errors.email && <ErrorText>{errors.email}</ErrorText>}
        </FieldWrapper>

        <FieldWrapper>
          <FieldLabel>비밀번호</FieldLabel>
          <StyledInput
            type="password"
            value={form.password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateField('password', e)
            }
            placeholder="8자 이상 입력하세요"
            $error={!!errors.password}
          />
          {errors.password && <ErrorText>{errors.password}</ErrorText>}
        </FieldWrapper>

        <FieldWrapper>
          <FieldLabel>이름</FieldLabel>
          <StyledInput
            type="text"
            value={form.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateField('name', e)
            }
            placeholder="이름을 입력하세요"
            $error={!!errors.name}
          />
          {errors.name && <ErrorText>{errors.name}</ErrorText>}
        </FieldWrapper>

        <FieldWrapper>
          <FieldLabel>연락처</FieldLabel>
          <StyledInput
            type="text"
            value={form.phoneNumber}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateField('phoneNumber', e)
            }
            placeholder="010-0000-0000"
            $error={!!errors.phoneNumber}
          />
          {errors.phoneNumber && <ErrorText>{errors.phoneNumber}</ErrorText>}
        </FieldWrapper>

        <FieldWrapper>
          <FieldLabel>권한</FieldLabel>
          <SelectDropdown
            variant="form"
            options={roleOptions}
            value={form.role}
            onChange={updateRole}
          />
        </FieldWrapper>
      </FieldGroup>

      <ButtonGroup>
        <SubmitButton type="button" onClick={handleSubmit}>
          추가
        </SubmitButton>
        <CancelButton type="button" onClick={handleCancel}>
          취소
        </CancelButton>
      </ButtonGroup>
    </Container>
  );
}

export function openAddManagerModal(): Promise<AddManagerInput | null> {
  return SnappyModal.show(<AddManagerModal />, {
    position: 'center',
  });
}

// ============================================
// Styled Components
// ============================================

const Container = tw.div`
  w-[400px]
  p-5
  bg-white
  rounded-[20px]
  flex
  flex-col
  gap-5
`;

const Title = tw.h3`
  text-[21px]
  font-bold
  leading-7
  text-[var(--fg-neutral)]
`;

const FieldGroup = tw.div`
  flex
  flex-col
  gap-4
`;

const FieldWrapper = tw.div`
  flex
  flex-col
  gap-2
`;

const FieldLabel = tw.label`
  text-[15px]
  leading-5
  text-[var(--fg-muted,#71717A)]
`;

const StyledInput = tw.input<{ $error?: boolean }>`
  w-full
  h-11
  px-4
  bg-white
  border
  rounded-xl
  text-[16.5px]
  leading-[22px]
  text-[var(--fg-neutral,#18181B)]
  placeholder:text-[var(--fg-placeholder,#9E9E9E)]
  outline-none
  transition-colors
  focus:ring-2 focus:ring-blue-500
  ${({ $error }) =>
    $error
      ? 'border-[var(--stroke-critical,#EB3D3D)]'
      : 'border-[var(--stroke-neutral,#E4E4E7)]'}
`;

const ErrorText = tw.p`
  text-sm
  text-[var(--fg-critical,#EB3D3D)]
`;

const ButtonGroup = tw.div`
  flex
  flex-col
  gap-2
`;

const SubmitButton = tw.button`
  h-11
  px-3
  bg-[var(--bg-primary-solid,#18181B)]
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
