/**
 * Button - 범용 버튼 컴포넌트
 *
 * Min Design System의 버튼 컴포넌트입니다.
 * 다양한 variant, size, kind를 지원하며, leading/trailing 아이콘을 추가할 수 있습니다.
 */

import type { ReactNode, ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼의 시각적 스타일 종류 */
  kind?: 'neutral' | 'primary' | 'critical' | 'muted';
  /** 버튼의 외형 스타일 */
  variant?: 'solid' | 'outline' | 'ghost' | 'glass';
  /** 버튼의 모서리 형태 */
  shape?: 'soft' | 'full';
  /** 버튼의 크기 */
  size?: 'small' | 'medium' | 'large';
  /** 버튼 앞에 표시할 아이콘 */
  leadingIcon?: ReactNode;
  /** 버튼 뒤에 표시할 아이콘 */
  trailingIcon?: ReactNode;
  /** 버튼 내용 */
  children: ReactNode;
  /** 비활성화 상태 */
  disabled?: boolean;
}

/**
 * kind와 variant에 따른 색상 스타일을 반환
 */
function getColorStyles(
  kind: 'neutral' | 'primary' | 'muted' | 'critical',
  variant: 'solid' | 'outline' | 'ghost' | 'subtle' | 'glass',
  disabled = false,
): string {
  if (disabled) {
    return ['bg-[var(--bg-disabled)]', 'text-[var(--fg-disabled)]', 'border-[var(--bg-disabled)]'].join(' ');
  }
  let fgColor = '', bgColor = '', borderColor = '';
  switch (kind) {
    case 'primary':
      fgColor = 'text-[var(--fg-primary)]';
      bgColor = 'bg-[var(--fg-primary)]';
      borderColor = 'border-[var(--fg-primary)]';
      break;
    case 'muted':
      fgColor = 'text-[var(--fg-muted)]';
      bgColor = 'bg-[var(--bg-muted)]';
      borderColor = 'border-[var(--bg-muted)]';
      break;
    case 'critical':
      fgColor = 'text-[var(--fg-critical)]';
      bgColor = 'bg-[var(--bg-critical)]';
      borderColor = 'border-[var(--bg-critical)]';
      break;
    case 'neutral':
    default:
      fgColor = 'text-[var(--fg-neutral)]';
      bgColor = 'bg-[var(--bg-neutral)]';
      borderColor = 'border-[var(--bg-critical)]';
  }

  switch (variant) {
    case 'outline':
      return [`bg-[var(--bg-neutral-subtle)]`, fgColor, `border-[var(--stroke-neutral)]`].join(' ');
    case 'subtle':
      return [`bg-[var(--bg-neutral-subtle)]`, fgColor, `border-[var(--stroke-neutral)]`].join(' ');
    case 'ghost':
      return [`bg-transparent`, fgColor, `border-transparent`].join(' ');
    case 'glass':
      return [`bg-[var(--bg-neutral-glass)]`, fgColor, `border-[var(--bg-neutral-glass)]`].join(' ');
    case 'solid':
    default:
      return [bgColor, `text-[var(--fg-on-surface)]`, borderColor].join(' ');
  }
}

export function Button({
  kind = 'neutral',
  variant = 'solid',
  shape = 'soft',
  size = 'large',
  leadingIcon,
  trailingIcon,
  children,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const state = disabled ? 'disabled' : 'enabled';

  const sizeStyles = {
    small: 'h-8 min-w-8 px-2 text-sm',
    medium: 'h-9 min-w-9 px-2.5 text-base',
    large: 'h-11 min-w-11 px-3 text-base',
  };

  const shapeStyles = {
    soft: 'rounded-xl',
    full: 'rounded-full',
  };

  const colorStyles = getColorStyles(kind, variant);
  const baseStyles = 'inline-flex justify-center items-center transition-colors';
  const disabledStyles = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer';

  return (
    <button
      type={type}
      data-contents="label"
      data-kind={kind}
      data-variant={variant}
      data-shape={shape}
      data-size={size}
      data-state={state}
      data-leading-icon={!!leadingIcon}
      data-trailing-icon={!!trailingIcon}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${colorStyles} ${shapeStyles[shape]} ${disabledStyles} ${className}`}
      {...props}
    >
      {leadingIcon && (
        <div className="h-5 flex justify-start items-center gap-2.5 overflow-hidden">
          <div className="w-5 h-5 relative overflow-hidden flex items-center justify-center">
            {leadingIcon}
          </div>
        </div>
      )}

      <div className="px-1 flex justify-start items-start">
        <div className="justify-start font-medium leading-snug">
          {children}
        </div>
      </div>

      {trailingIcon && (
        <div className="h-5 flex justify-start items-center gap-2.5 overflow-hidden">
          <div className="w-5 h-5 relative overflow-hidden flex items-center justify-center">
            {trailingIcon}
          </div>
        </div>
      )}
    </button>
  );
}

/**
 * Usage:
 *
 * // 기본 버튼 (neutral + solid)
 * <Button>기본 버튼</Button>
 *
 * // kind별 solid 버튼
 * <Button kind="neutral" variant="solid">Neutral</Button>
 * <Button kind="primary" variant="solid">Primary</Button>
 * <Button kind="secondary" variant="solid">Secondary</Button>
 * <Button kind="critical" variant="solid">Critical</Button>
 *
 * // kind별 outline 버튼
 * <Button kind="neutral" variant="outline">Neutral Outline</Button>
 * <Button kind="primary" variant="outline">Primary Outline</Button>
 * <Button kind="secondary" variant="outline">Secondary Outline</Button>
 * <Button kind="critical" variant="outline">Critical Outline</Button>
 *
 * // kind별 ghost 버튼
 * <Button kind="neutral" variant="ghost">Neutral Ghost</Button>
 * <Button kind="primary" variant="ghost">Primary Ghost</Button>
 * <Button kind="secondary" variant="ghost">Secondary Ghost</Button>
 * <Button kind="critical" variant="ghost">Critical Ghost</Button>
 *
 * // 아이콘 버튼
 * <Button
 *   kind="primary"
 *   leadingIcon={<PlusIcon />}
 *   trailingIcon={<ArrowIcon />}
 * >
 *   아이콘 버튼
 * </Button>
 *
 * // 크기별 버튼
 * <Button size="small">작은 버튼</Button>
 * <Button size="medium">중간 버튼</Button>
 * <Button size="large">큰 버튼</Button>
 *
 * // 비활성화
 * <Button disabled kind="primary">비활성화</Button>
 *
 * // 폼 제출 버튼
 * <Button type="submit" kind="primary">
 *   제출하기
 * </Button>
 */
