import tw from 'tailwind-styled-components';

export const Table = tw.table`
  w-full
  border-collapse
`;

export const THead = tw.thead`
  [background:var(--bg-neutral-subtle)]
`;

export const TBody = tw.tbody`
  [background:var(--bg-neutral-subtle)]
  divide-y
  [border-color:var(--stroke-neutral-subtle)]
`;

export { TR } from './row';
export { TH, TD } from './cell';
