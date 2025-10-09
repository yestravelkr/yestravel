import { TextareaHTMLAttributes, forwardRef } from 'react';
import tw from 'tailwind-styled-components';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <StyledTextarea
        ref={ref}
        $error={error}
        className={className}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';

const StyledTextarea = tw.textarea<{ $error?: boolean }>`
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
  resize-vertical
  ${(p) => p.$error && 'border-red-300 focus:ring-red-500 focus:border-red-500'}
`;
