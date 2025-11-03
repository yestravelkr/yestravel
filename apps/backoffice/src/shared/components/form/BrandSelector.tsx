/**
 * BrandSelector - 브랜드 선택 컴포넌트
 *
 * API에서 브랜드 목록을 조회하여 선택할 수 있는 컴포넌트입니다.
 * useFormContext를 통해 React Hook Form과 자동으로 연동됩니다.
 */

import { useFormContext } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import { trpc } from '@/shared/trpc';

export interface BrandSelectorProps {
  /** HTML id 속성 */
  id?: string;
  /** 폼 필드명 */
  name: string;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 필수 여부 */
  required?: boolean;
  /** 기본 선택 값 */
  defaultValue?: number;
}

export function BrandSelector({
  id = 'brandId',
  name = 'brandId',
  disabled,
  required,
  defaultValue,
}: BrandSelectorProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // 브랜드 목록 조회
  const {
    data: brands,
    isLoading,
    isError,
  } = trpc.backofficeBrand.findAll.useQuery();

  const error = errors[name];

  if (isLoading) {
    return (
      <Select id={id} disabled>
        <option>브랜드 로딩 중...</option>
      </Select>
    );
  }

  // 에러 발생 시 빈 리스트 표시
  const brandList = isError ? [] : brands || [];

  return (
    <Select
      id={id}
      $error={!!error}
      disabled={disabled}
      defaultValue={defaultValue}
      {...register(name, {
        valueAsNumber: true,
        required: required ? '브랜드를 선택해주세요.' : false,
      })}
    >
      <option value="">브랜드를 선택하세요</option>
      {brandList.map((brand) => (
        <option key={brand.id} value={brand.id}>
          {brand.name}(ID: {brand.id})
        </option>
      ))}
    </Select>
  );
}

const Select = tw.select<{ $error?: boolean }>`
  w-full
  px-4
  py-2.5
  border
  ${(p) => (p.$error ? 'border-red-500' : 'border-gray-300')}
  rounded-lg
  text-sm
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-transparent
  disabled:bg-gray-100
  disabled:cursor-not-allowed
`;

/**
 * Usage:
 *
 * import { BrandSelector } from '@/shared/components/form/BrandSelector';
 * import { FormProvider } from 'react-hook-form';
 *
 * // FormProvider로 감싸진 폼 내부에서 사용
 * const methods = useForm();
 *
 * <FormProvider {...methods}>
 *   <form>
 *     <BrandSelector
 *       name="brandId"
 *       required
 *     />
 *   </form>
 * </FormProvider>
 */
