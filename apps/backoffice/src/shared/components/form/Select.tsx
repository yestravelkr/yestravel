import { SelectHTMLAttributes, forwardRef } from 'react';
import tw from 'tailwind-styled-components';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, error, className, ...props }, ref) => {
    return (
      <StyledSelect ref={ref} $error={error} className={className} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </StyledSelect>
    );
  },
);

Select.displayName = 'Select';

const StyledSelect = tw.select<{ $error?: boolean }>`
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
  bg-white
  ${(p) => p.$error && 'border-red-300 focus:ring-red-500 focus:border-red-500'}
`;
