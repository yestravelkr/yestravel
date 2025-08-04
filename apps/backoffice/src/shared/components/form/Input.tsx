import { InputHTMLAttributes, forwardRef } from 'react';
import tw from 'tailwind-styled-components';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <StyledInput ref={ref} $error={error} className={className} {...props} />
    );
  },
);

Input.displayName = 'Input';

const StyledInput = tw.input<{ $error?: boolean }>`
  block 
  w-full 
  px-3 
  py-2 
  border 
  border-gray-300 
  rounded-lg 
  shadow-sm 
  focus:outline-none 
  focus:ring-2 
  focus:ring-blue-500 
  focus:border-blue-500
  placeholder:text-gray-400
  ${(p) => p.$error && 'border-red-300 focus:ring-red-500 focus:border-red-500'}
`;
