/**
 * CampaignInfluencerSection - 캠페인 인플루언서 섹션
 *
 * 캠페인에 포함될 인플루언서 목록을 관리하는 섹션입니다.
 * allInfluencers를 Map으로 변환하여 formInfluencers의 id로 데이터를 조회합니다.
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
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import type {
  CampaignFormData,
  CampaignInfluencerDisplay,
  CampaignInfluencerFormData,
} from './types';

import { openInfluencerSalesSettingModal } from '@/components/campaign/InfluencerSalesSettingModal';
import { openInfluencerSelectModal } from '@/components/campaign/InfluencerSelectModal';
import { trpc } from '@/shared/trpc';

export function CampaignInfluencerSection() {
  const { control, setValue } = useFormContext<CampaignFormData>();

  // hookForm에 저장된 간소화된 데이터 감시
  const formInfluencers = useWatch({
    control,
    name: 'influencers',
    defaultValue: [],
  });

  // 캠페인 기간 (기본값으로 사용)
  const dateRange = useWatch({
    control,
    name: 'dateRange',
  });

  // 인플루언서 리스트 조회
  const { data: allInfluencers } = trpc.backofficeInfluencer.findAll.useQuery({
    page: 1,
    limit: 100,
  });

  // allInfluencers를 id를 key로 하는 Map으로 변환
  const influencersMap = useMemo(() => {
    if (!allInfluencers) return new Map();

    return new Map(
      allInfluencers.data.map((influencer) => [
        influencer.id,
        {
          influencerId: influencer.id,
          name: influencer.name,
          email: influencer.email,
          phoneNumber: influencer.phoneNumber,
        },
      ]),
    );
  }, [allInfluencers]);

  // formInfluencers와 influencersMap을 조합하여 화면 표시용 데이터 생성
  const displayInfluencers = useMemo(() => {
    return formInfluencers
      .map((formInfluencer) => {
        const influencerInfo = influencersMap.get(formInfluencer.influencerId);
        if (!influencerInfo) return null;

        return {
          ...influencerInfo,
          periodType: formInfluencer.periodType,
          startAt: formInfluencer.startAt,
          endAt: formInfluencer.endAt,
          feeType: formInfluencer.feeType,
          fee: formInfluencer.fee,
          status: formInfluencer.status,
          products: formInfluencer.products,
        } as CampaignInfluencerDisplay;
      })
      .filter(
        (influencer): influencer is CampaignInfluencerDisplay =>
          influencer !== null,
      );
  }, [formInfluencers, influencersMap]);

  const handleAddInfluencer = async () => {
    const currentInfluencerIds = formInfluencers.map(
      (influencer) => influencer.influencerId,
    );
    const selectedIds = await openInfluencerSelectModal(currentInfluencerIds);

    if (selectedIds) {
      // 선택한 ID로 formData 생성 (초기값 설정)
      const newFormData: CampaignInfluencerFormData[] = selectedIds.map(
        (id) => ({
          influencerId: id,
          periodType: 'DEFAULT' as const,
          startAt: null,
          endAt: null,
          feeType: 'NONE' as const,
          fee: null,
          status: 'VISIBLE' as const,
          products: [],
        }),
      );

      setValue('influencers', newFormData, { shouldValidate: true });
    }
  };

  const handleRemoveInfluencer = (index: number) => {
    const updatedForm = formInfluencers.filter((_, i) => i !== index);
    setValue('influencers', updatedForm, { shouldValidate: true });
  };

  const handleOpenSalesSetting = async (
    influencer: CampaignInfluencerDisplay,
    index: number,
  ) => {
    const formData: CampaignInfluencerFormData = {
      influencerId: influencer.influencerId,
      periodType: influencer.periodType,
      startAt: influencer.startAt,
      endAt: influencer.endAt,
      feeType: influencer.feeType,
      fee: influencer.fee,
      status: influencer.status,
      products: influencer.products,
    };

    const result = await openInfluencerSalesSettingModal(
      formData,
      influencer.name,
      dateRange,
    );

    if (result) {
      const updatedInfluencers = [...formInfluencers];
      updatedInfluencers[index] = {
        influencerId: result.influencerId,
        periodType: result.periodType,
        startAt: result.startAt,
        endAt: result.endAt,
        feeType: result.feeType,
        fee: result.fee,
        status: result.status,
        products: result.products,
      };
      setValue('influencers', updatedInfluencers, { shouldValidate: true });
    }
  };

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
        {displayInfluencers.length === 0 ? (
          <EmptyMessage>추가된 인플루언서가 없습니다.</EmptyMessage>
        ) : (
          <TableContainer>
            <Table>
              <THead>
                <TR>
                  <TH>이름</TH>
                  <TH>이메일</TH>
                  <TH>전화번호</TH>
                  <TH>&nbsp;</TH>
                  <TH>&nbsp;</TH>
                </TR>
              </THead>
              <TBody>
                {displayInfluencers.map((influencer, index) => (
                  <TR key={influencer.influencerId}>
                    <TD>{influencer.name}</TD>
                    <TD>{influencer.email || '-'}</TD>
                    <TD>{influencer.phoneNumber || '-'}</TD>
                    <TD>
                      <SettingButton
                        type="button"
                        onClick={() =>
                          handleOpenSalesSetting(influencer, index)
                        }
                        kind="neutral"
                        variant="outline"
                        size="small"
                      >
                        판매설정
                      </SettingButton>
                    </TD>
                    <TD>
                      <RemoveButton
                        type="button"
                        onClick={() => handleRemoveInfluencer(index)}
                        kind="critical"
                        variant="outline"
                        size="small"
                      >
                        삭제
                      </RemoveButton>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableContainer>
        )}
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
  p-0
`;

const EmptyMessage = tw.div`
  text-center
  py-12
  text-[var(--fg-muted)]
  text-sm
`;

const TableContainer = tw.div`
  border-t
  border-[var(--stroke-neutral)]
`;

const RemoveButton = tw(Button)`
  w-full
`;

const SettingButton = tw(Button)`
  w-full
`;

/**
 * Usage:
 *
 * <CampaignInfluencerSection />
 */
