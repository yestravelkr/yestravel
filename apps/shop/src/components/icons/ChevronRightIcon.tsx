/**
 * ChevronRightIcon - 오른쪽 화살표 아이콘
 *
 * Usage:
 * <ChevronRightIcon />
 * <ChevronRightIcon className="w-4 h-4" />
 */

export interface ChevronRightIconProps {
  className?: string;
}

export function ChevronRightIcon({ className = '' }: ChevronRightIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="9"
      height="16"
      viewBox="0 0 9 16"
      fill="none"
      className={`shrink-0 ${className}`}
    >
      <path
        d="M0.21967 0.21967C0.512563 -0.0732233 0.987324 -0.0732233 1.28022 0.21967L8.28022 7.21967C8.57311 7.51256 8.57311 7.98732 8.28022 8.28022L1.28022 15.2802C0.987324 15.5731 0.512563 15.5731 0.21967 15.2802C-0.0732232 14.9873 -0.0732232 14.5126 0.21967 14.2197L6.6894 7.74994L0.21967 1.28022C-0.0732233 0.987324 -0.0732233 0.512563 0.21967 0.21967Z"
        fill="#9E9E9E"
      />
    </svg>
  );
}
