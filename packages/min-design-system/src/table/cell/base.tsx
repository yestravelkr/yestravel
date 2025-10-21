import tw from "tailwind-styled-components";

export const TH = tw.th`
  text-left
  [font:var(--typo-body-medium)]
  [color:var(--fg-muted)]
  px-2
  py-3
  border-b
  [border-color:var(--stroke-neutral-subtle)]
`;

export const TDDefault = tw.td`
  text-left
  [font:var(--typo-body-medium)]
  [color:var(--fg-neutral)]
  px-2
  py-3
  border-b
  [border-color:var(--stroke-neutral-subtle)]
`;