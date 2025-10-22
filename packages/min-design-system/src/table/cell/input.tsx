import { ReactNode, InputHTMLAttributes, useMemo } from 'react';
import tw from 'tailwind-styled-components';
import { TDDefault } from './base';

/**
 * TDInput - 테이블 셀 인풋 컴포넌트
 * 
 * 테이블 셀 내부에서 사용되는 인풋 필드 컴포넌트입니다.
 * error, readonly 상태와 prefix, postfix를 지원합니다.
 */

interface TDInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  error?: boolean;
  prefix?: ReactNode;
  postfix?: ReactNode;
  containerClassName?: string;
}

const InputContainer = tw(TDDefault)`
  min-h-[44px]
  flex
  items-start
  gap-1
  border
  border-transparent
`;

const StyledInput = tw.input`
  flex-1
  [font:var(--typo-body-medium)]
  leading-5
  outline-none
  border-none
  bg-transparent
  [color:var(--fg-neutral)]
  placeholder:[color:var(--fg-placeholder)]
  disabled:[color:var(--fg-disabled)]
`;

export const TDInput = ({ 
  error,
  prefix,
  postfix,
  containerClassName,
  className,
  readOnly,
  disabled,
  ...inputProps
}: TDInputProps) => {
  const backgroundColor = useMemo(() => {
    if (readOnly) return '[background:var(--bg-readonly)]';
    return '[background:var(--bg-field)]';
  }, [readOnly]);

  const borderStyle = useMemo(() => {
    if (error) return '!border ![border-color:var(--stroke-critical)]';
    if (!readOnly) return 'has-[:focus]:border has-[:focus]:[border-color:var(--stroke-primary)]';
    return '';
  }, [error, readOnly]);

  const addonColor = useMemo(() => {
    if (disabled) return '[color:var(--fg-disabled)]';
    return '[color:var(--fg-muted)]';
  }, [disabled]);

  return (
    <InputContainer
      className={`${backgroundColor} ${borderStyle} ${containerClassName || ''}`}
      data-error={error}
    >
      {prefix && <div className={addonColor}>{prefix}</div>}
      <StyledInput
        className={className}
        readOnly={readOnly}
        disabled={disabled}
        {...inputProps}
      />
      {postfix && <div className={addonColor}>{postfix}</div>}
    </InputContainer>
  );
};

// Usage:
// 
// import { Table, TBody, TR, TD } from '@/table';
// import { TDInput } from '@/table/cell/input';
// 
// <Table>
//   <TBody>
//     <TR>
//       // 기본
//       <TD>
//         <TDInput placeholder="label" />
//       </TD>
//       
//       // Error 상태
//       <TD>
//         <TDInput value="label" error />
//       </TD>
//       
//       // Disabled
//       <TD>
//         <TDInput value="label" disabled />
//       </TD>
//       
//       // Readonly 상태
//       <TD>
//         <TDInput value="label" readOnly />
//       </TD>
//     </TR>
//     <TR>
//       // Prefix
//       <TD>
//         <TDInput prefix={<Icon />} placeholder="label" />
//       </TD>
//       
//       // Postfix
//       <TD>
//         <TDInput postfix={<Icon />} placeholder="label" />
//       </TD>
//       
//       // Prefix addon
//       <TD>
//         <TDInput prefix="addon" placeholder="label" />
//       </TD>
//       
//       // Postfix addon
//       <TD>
//         <TDInput postfix="addon" placeholder="label" />
//       </TD>
//     </TR>
//   </TBody>
// </Table>
