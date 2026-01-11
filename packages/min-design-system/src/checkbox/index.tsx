/**
 * Checkbox - 체크박스 컴포넌트
 *
 * Min Design System의 체크박스 컴포넌트입니다.
 * 다양한 크기와 라벨을 지원합니다.
 */

import type { ReactNode, ButtonHTMLAttributes } from 'react';

export interface CheckboxProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** 체크 상태 */
  checked: boolean;
  /** 체크 상태 변경 핸들러 */
  onChange: (checked: boolean) => void;
  /** 체크박스 크기 */
  size?: 'small' | 'medium' | 'large';
  /** 라벨 텍스트 또는 ReactNode */
  label?: ReactNode;
  /** 비활성화 상태 */
  disabled?: boolean;
}

/**
 * 크기별 스타일 설정
 */
const SIZE_CONFIG = {
  small: {
    box: 'w-4 h-4',
    icon: 'text-[10px]',
    label: 'text-sm leading-4',
    gap: 'gap-1',
  },
  medium: {
    box: 'w-5 h-5',
    icon: 'text-[14px]',
    label: 'text-base leading-5',
    gap: 'gap-1',
  },
  large: {
    box: 'w-6 h-6',
    icon: 'text-[16px]',
    label: 'text-lg leading-6',
    gap: 'gap-2',
  },
};

export function Checkbox({
  checked,
  onChange,
  size = 'medium',
  label,
  disabled = false,
  className = '',
  ...props
}: CheckboxProps) {
  const config = SIZE_CONFIG[size];

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const boxStyles = [
    config.box,
    'rounded',
    'flex items-center justify-center',
    'transition-colors',
    'border',
    checked
      ? 'bg-[var(--fg-primary)] border-[var(--fg-primary)]'
      : 'bg-[var(--bg-field)] border-[var(--fg-disabled)]',
    disabled && 'opacity-50 cursor-not-allowed',
  ]
    .filter(Boolean)
    .join(' ');

  const containerStyles = [
    'inline-flex items-center',
    config.gap,
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const labelStyles = [
    config.label,
    'font-normal',
    disabled ? 'text-[var(--fg-disabled)]' : 'text-[var(--fg-neutral)]',
  ].join(' ');

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      onClick={handleClick}
      className={containerStyles}
      disabled={disabled}
      {...props}
    >
      <div className={boxStyles}>
        {checked && <i className={`icon icon-check-solid text-white ${config.icon}`} />}
      </div>
      {label && <span className={labelStyles}>{label}</span>}
    </button>
  );
}

/**
 * Usage:
 *
 * // 기본 체크박스
 * <Checkbox
 *   checked={isChecked}
 *   onChange={setIsChecked}
 * />
 *
 * // 라벨이 있는 체크박스
 * <Checkbox
 *   checked={isChecked}
 *   onChange={setIsChecked}
 *   label="동의합니다"
 * />
 *
 * // 크기별 체크박스
 * <Checkbox size="small" checked={checked} onChange={setChecked} label="작은 체크박스" />
 * <Checkbox size="medium" checked={checked} onChange={setChecked} label="중간 체크박스" />
 * <Checkbox size="large" checked={checked} onChange={setChecked} label="큰 체크박스" />
 *
 * // 비활성화 상태
 * <Checkbox
 *   checked={true}
 *   onChange={() => {}}
 *   disabled
 *   label="비활성화된 체크박스"
 * />
 */
