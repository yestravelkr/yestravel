/**
 * Shared styled components for cancel modals
 *
 * CancelApproveModal, CancelOrderModal 등에서 공통으로 사용하는
 * styled components를 정의합니다.
 */

import tw from 'tailwind-styled-components';

// ========================================
// Styled Components - Main Modal
// ========================================

export const Container = tw.div`
  w-[480px]
  p-5
  bg-white
  rounded-[20px]
  flex flex-col gap-5
`;

export const Header = tw.div`
  flex items-center h-9
`;

export const Title = tw.p`
  flex-1
  text-[21px] font-bold
  text-[var(--fg-neutral)]
  leading-7
`;

export const InputSection = tw.div`
  flex flex-col gap-2
`;

export const InputLabel = tw.p`
  text-[15px] font-normal
  text-[var(--fg-muted)]
  leading-5
`;

export const InputWrapper = tw.div`
  flex items-center
  h-11
  px-3
  bg-white
  border border-[var(--stroke-neutral)]
  rounded-xl
`;

export const StyledInput = tw.input`
  flex-1
  text-[16.5px]
  text-[var(--fg-neutral)]
  leading-[22px]
  outline-none
  bg-transparent
  placeholder:text-[var(--fg-placeholder)]
`;

export const InputSuffix = tw.span`
  text-[16.5px]
  text-[var(--fg-muted)]
  leading-[22px]
  ml-1
`;

export const SummaryBox = tw.div`
  bg-[var(--bg-neutral)]
  rounded-xl
  p-5
  flex flex-col gap-5
`;

export const SummaryRow = tw.div`
  flex items-center gap-2
`;

export const SummaryLabel = tw.p`
  w-[100px]
  text-[16.5px] font-normal
  text-[var(--fg-neutral)]
  leading-[22px]
`;

export const SummaryValue = tw.p`
  flex-1
  text-[16.5px] font-normal
  text-[var(--fg-neutral)]
  leading-[22px]
  text-right
`;

export const RefundAmount = tw.p`
  flex-1
  text-[21px] font-bold
  text-[var(--fg-neutral)]
  leading-7
  text-right
`;

export const Divider = tw.div`
  h-px
  bg-[var(--stroke-neutral)]
`;

export const ButtonGroup = tw.div`
  flex gap-2
`;

// ========================================
// Styled Components - Confirm Dialog
// ========================================

export const DialogContainer = tw.div`
  w-[320px]
  p-3
  bg-white
  rounded-[20px]
  flex flex-col gap-5
`;

export const DialogContent = tw.div`
  flex flex-col gap-2
  px-2 py-3
`;

export const DialogTitle = tw.p`
  text-lg font-bold
  text-[var(--fg-neutral)]
  leading-6
`;

export const DialogDescription = tw.p`
  text-[15px] font-normal
  text-[var(--fg-neutral)]
  leading-5
`;

export const DialogButtonGroup = tw.div`
  flex flex-col gap-2
`;

export const CriticalButton = tw.button`
  w-full h-11
  flex items-center justify-center
  bg-[var(--bg-critical-solid,#EB3D3D)]
  rounded-xl
  text-[16.5px] font-medium
  text-white
  leading-[22px]
`;
