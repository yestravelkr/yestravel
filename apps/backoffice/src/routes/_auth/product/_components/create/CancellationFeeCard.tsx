/**
 * CancellationFeeCard - 취소 수수료 설정 카드
 *
 * 숙박 상품의 취소 수수료 정책을 입력하는 컴포넌트입니다.
 * 체크인 N일 전 취소 시 부과되는 수수료 퍼센트를 설정합니다.
 */

import {
  Button,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from '@yestravelkr/min-design-system';
import { Plus } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import { FormCard } from '@/shared/components/form/FormLayout';

interface CancellationFee {
  daysBeforeCheckIn: number;
  feePercentage: number;
}

export function CancellationFeeCard() {
  const { watch, setValue } = useFormContext();
  const cancellationFees =
    (watch('cancellationFees') as CancellationFee[]) || [];

  const handleAdd = () => {
    const newFees = [
      ...cancellationFees,
      { daysBeforeCheckIn: 0, feePercentage: 0 },
    ];
    setValue('cancellationFees', newFees);
  };

  const handleRemove = (index: number) => {
    const newFees = cancellationFees.filter((_, i) => i !== index);
    setValue('cancellationFees', newFees);
  };

  const handleUpdate = (
    index: number,
    field: keyof CancellationFee,
    value: number,
  ) => {
    const newFees = [...cancellationFees];
    newFees[index] = { ...newFees[index], [field]: value };
    setValue('cancellationFees', newFees);
  };

  return (
    <FormCard title="취소 수수료">
      <Table>
        <THead>
          <TR>
            <TH style={{ width: 120 }}>취소일</TH>
            <TH style={{ width: 120 }}>수수료</TH>
            <TH />
          </TR>
        </THead>
        <TBody>
          {cancellationFees.map((fee, index) => (
            <TR key={index}>
              <TD.Input
                type="number"
                placeholder="0"
                value={fee.daysBeforeCheckIn || ''}
                onChange={(e) =>
                  handleUpdate(
                    index,
                    'daysBeforeCheckIn',
                    Number(e.target.value),
                  )
                }
                min={0}
                postfix="일 전"
              />
              <TD.Input
                type="number"
                placeholder="0"
                value={fee.feePercentage || ''}
                onChange={(e) =>
                  handleUpdate(index, 'feePercentage', Number(e.target.value))
                }
                min={0}
                max={100}
                postfix="%"
              />
              <TD>
                <div className="flex justify-end">
                  <Button
                    kind="critical"
                    variant="outline"
                    shape="soft"
                    size="small"
                    onClick={() => handleRemove(index)}
                  >
                    삭제
                  </Button>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <AddButton type="button" onClick={handleAdd}>
        <Plus size={16} />
        수수료 추가
      </AddButton>
    </FormCard>
  );
}

/**
 * Usage:
 *
 * <FormProvider {...methods}>
 *   <CancellationFeeCard />
 * </FormProvider>
 */

// Styled Components

const AddButton = tw.button`
  flex items-center gap-1 mt-4 text-sm text-gray-500 hover:text-gray-700
`;
