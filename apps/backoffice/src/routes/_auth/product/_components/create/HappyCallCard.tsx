/**
 * HappyCallCard - 해피콜/이용가이드 설정 카드
 *
 * 호텔 상품의 해피콜 사용여부, 이용가이드 사용여부와 각각의 링크를 설정합니다.
 */

import { useFormContext } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import { FormCard } from '@/shared/components/form/FormLayout';

export function HappyCallCard() {
  const { watch, setValue } = useFormContext();
  const happyCallConfig = watch('happyCallConfig') ?? {
    useHappyCall: false,
    useGuide: false,
    happyCallLink: null,
    guideLink: null,
  };

  const updateConfig = (key: string, value: any) => {
    setValue('happyCallConfig', { ...happyCallConfig, [key]: value });
  };

  return (
    <FormCard title="해피콜">
      <SettingList>
        {/* 해피콜 사용여부 */}
        <SettingItem>
          <SettingInfo>
            <SettingLabel>해피콜 사용여부</SettingLabel>
            <SettingDescription>
              예약 확정 해피콜을 사용하는 경우 선택해 주세요.
            </SettingDescription>
          </SettingInfo>
          <ToggleSwitch
            checked={happyCallConfig.useHappyCall}
            onChange={(checked) => updateConfig('useHappyCall', checked)}
          />
        </SettingItem>

        {/* 이용가이드 사용여부 */}
        <SettingItem>
          <SettingInfo>
            <SettingLabel>이용가이드 사용여부</SettingLabel>
            <SettingDescription>
              이용가이드를 첨부하는 경우 선택해 주세요.
            </SettingDescription>
          </SettingInfo>
          <ToggleSwitch
            checked={happyCallConfig.useGuide}
            onChange={(checked) => updateConfig('useGuide', checked)}
          />
        </SettingItem>
      </SettingList>

      {/* 해피콜 링크 - 토글 on일 때만 표시 */}
      {happyCallConfig.useHappyCall && (
        <LinkField>
          <LinkLabel>해피콜 링크</LinkLabel>
          <LinkInput
            type="url"
            placeholder="http://"
            value={happyCallConfig.happyCallLink || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateConfig('happyCallLink', e.target.value || null)
            }
          />
        </LinkField>
      )}

      {/* 이용가이드 링크 - 토글 on일 때만 표시 */}
      {happyCallConfig.useGuide && (
        <LinkField>
          <LinkLabel>이용가이드 링크</LinkLabel>
          <LinkInput
            type="url"
            placeholder="http://"
            value={happyCallConfig.guideLink || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateConfig('guideLink', e.target.value || null)
            }
          />
        </LinkField>
      )}
    </FormCard>
  );
}

/**
 * Usage:
 * <HappyCallCard />
 * (FormProvider 내부에서 사용, happyCallConfig 필드 필요)
 */

// --- Toggle Switch 컴포넌트 ---
function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <ToggleButton
      type="button"
      role="switch"
      aria-checked={checked}
      $checked={checked}
      onClick={() => onChange(!checked)}
    >
      <ToggleThumb $checked={checked} />
    </ToggleButton>
  );
}

// --- Styled Components ---
const SettingList = tw.div`
  space-y-4
  mb-4
`;

const SettingItem = tw.div`
  flex
  items-center
  justify-between
  py-2
`;

const SettingInfo = tw.div`
  flex
  flex-col
`;

const SettingLabel = tw.span`
  text-sm
  font-medium
  text-gray-900
`;

const SettingDescription = tw.span`
  text-xs
  text-gray-500
  mt-0.5
`;

const ToggleButton = tw.button<{ $checked: boolean }>`
  relative
  inline-flex
  h-6
  w-11
  flex-shrink-0
  cursor-pointer
  rounded-full
  border-2
  border-transparent
  transition-colors
  duration-200
  ease-in-out
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:ring-offset-2
  ${(p) => (p.$checked ? 'bg-blue-500' : 'bg-gray-200')}
`;

const ToggleThumb = tw.span<{ $checked: boolean }>`
  pointer-events-none
  inline-block
  h-5
  w-5
  transform
  rounded-full
  bg-white
  shadow
  ring-0
  transition
  duration-200
  ease-in-out
  ${(p) => (p.$checked ? 'translate-x-5' : 'translate-x-0')}
`;

const LinkField = tw.div`
  mt-4
  space-y-1
`;

const LinkLabel = tw.label`
  block
  text-sm
  font-medium
  text-gray-700
`;

const LinkInput = tw.input`
  block
  w-full
  rounded-md
  border
  border-gray-300
  px-3
  py-2
  text-sm
  placeholder-gray-400
  focus:border-blue-500
  focus:outline-none
  focus:ring-1
  focus:ring-blue-500
`;
