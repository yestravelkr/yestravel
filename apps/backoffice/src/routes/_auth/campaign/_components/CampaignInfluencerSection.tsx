/**
 * CampaignInfluencerSection - 캠페인 인플루언서 섹션
 *
 * 캠페인에 포함될 인플루언서 목록을 관리하는 섹션입니다.
 */

import { Button } from '@yestravelkr/min-design-system';
import { Plus, X } from 'lucide-react';
import { Control, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import type { CampaignFormData } from './types';

import { Select } from '@/shared/components';

interface CampaignInfluencerSectionProps {
  control: Control<CampaignFormData>;
}

export function CampaignInfluencerSection({
  control,
}: CampaignInfluencerSectionProps) {
  const handleAddInfluencer = async () => {
    // TODO: 인플루언서 선택 모달 열기
    toast.info('인플루언서 선택 모달 구현 예정');
  };

  const statusOptions = [
    { value: 'ACTIVE', label: '활성' },
    { value: 'INACTIVE', label: '비활성' },
  ];

  return (
    <FormSection>
      <SectionHeader>
        <SectionTitle>인플루언서</SectionTitle>
        <Button
          type="button"
          onClick={handleAddInfluencer}
          kind="primary"
          size="medium"
          leadingIcon={<Plus size={16} />}
        >
          인플루언서 추가
        </Button>
      </SectionHeader>
      <SectionContent>
        <Controller
          name="influencers"
          control={control}
          rules={{
            validate: (value) =>
              value.length > 0 || '최소 1개 이상의 인플루언서를 추가해주세요',
          }}
          render={({ field }) => (
            <>
              {field.value.length === 0 ? (
                <EmptyMessage>추가된 인플루언서가 없습니다.</EmptyMessage>
              ) : (
                <InfluencerList>
                  {field.value.map((influencer, index) => (
                    <InfluencerItem key={influencer.id}>
                      <InfluencerInfo>
                        <InfluencerField>
                          <FieldLabel>인플루언서명</FieldLabel>
                          <FieldValue>{influencer.name}</FieldValue>
                        </InfluencerField>
                        <InfluencerField>
                          <FieldLabel>이메일</FieldLabel>
                          <FieldValue>{influencer.email || '-'}</FieldValue>
                        </InfluencerField>
                        <InfluencerField>
                          <FieldLabel>전화번호</FieldLabel>
                          <FieldValue>
                            {influencer.phoneNumber || '-'}
                          </FieldValue>
                        </InfluencerField>
                        <InfluencerField>
                          <FieldLabel>상태</FieldLabel>
                          <Select
                            value={influencer.status}
                            onChange={(e) => {
                              const newInfluencers = [...field.value];
                              newInfluencers[index] = {
                                ...newInfluencers[index],
                                status: e.target.value as 'ACTIVE' | 'INACTIVE',
                              };
                              field.onChange(newInfluencers);
                            }}
                            options={statusOptions}
                          />
                        </InfluencerField>
                      </InfluencerInfo>
                      <RemoveButton
                        type="button"
                        onClick={() => {
                          const newInfluencers = field.value.filter(
                            (_, i) => i !== index,
                          );
                          field.onChange(newInfluencers);
                        }}
                      >
                        <X size={16} />
                      </RemoveButton>
                    </InfluencerItem>
                  ))}
                </InfluencerList>
              )}
            </>
          )}
        />
      </SectionContent>
    </FormSection>
  );
}

const FormSection = tw.div`
  bg-white
  rounded-lg
  border
  border-[var(--stroke-neutral)]
  overflow-hidden
`;

const SectionHeader = tw.div`
  px-6
  py-4
  border-b
  border-[var(--stroke-neutral)]
  flex
  justify-between
  items-center
`;

const SectionTitle = tw.h2`
  text-base
  font-semibold
  text-[var(--fg-neutral)]
`;

const SectionContent = tw.div`
  p-6
`;

const EmptyMessage = tw.div`
  text-center
  py-12
  text-[var(--fg-muted)]
  text-sm
`;

const InfluencerList = tw.div`
  flex
  flex-col
  gap-3
`;

const InfluencerItem = tw.div`
  border
  border-[var(--stroke-neutral)]
  rounded-lg
  p-4
  flex
  items-start
  justify-between
  gap-4
  bg-[var(--bg-layer)]
`;

const InfluencerInfo = tw.div`
  flex-1
  grid
  grid-cols-2
  md:grid-cols-4
  gap-4
`;

const InfluencerField = tw.div`
  flex
  flex-col
  gap-1
`;

const FieldLabel = tw.span`
  text-xs
  font-medium
  text-[var(--fg-muted)]
`;

const FieldValue = tw.span`
  text-sm
  text-[var(--fg-neutral)]
`;

const RemoveButton = tw.button`
  p-2
  text-[var(--fg-muted)]
  hover:text-red-600
  hover:bg-red-50
  rounded
  transition-colors
  flex-shrink-0
`;

/**
 * Usage:
 *
 * <CampaignInfluencerSection control={control} />
 */
