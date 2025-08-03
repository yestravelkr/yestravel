import { useEffect } from 'react';
import tw from 'tailwind-styled-components';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <ToastContainer $type={type}>
      <ToastMessage>{message}</ToastMessage>
      <CloseButton onClick={onClose}>×</CloseButton>
    </ToastContainer>
  );
}

interface ToastContainerProps {
  children: React.ReactNode;
}

export function ToastsContainer({ children }: ToastContainerProps) {
  return <ToastsWrapper>{children}</ToastsWrapper>;
}

const ToastsWrapper = tw.div`
  fixed 
  top-4 
  right-4 
  z-50 
  space-y-2
`;

const ToastContainer = tw.div<{ $type: 'success' | 'error' | 'info' }>`
  flex 
  items-center 
  justify-between 
  p-4 
  rounded-lg 
  shadow-lg 
  max-w-sm 
  min-w-[300px]
  ${(p) => {
    switch (p.$type) {
      case 'success':
        return 'bg-green-50 text-green-800 border border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border border-red-200';
      case 'info':
        return 'bg-blue-50 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-50 text-gray-800 border border-gray-200';
    }
  }}
`;

const ToastMessage = tw.span`
  flex-1 
  text-sm 
  font-medium
`;

const CloseButton = tw.button`
  ml-3 
  text-lg 
  font-bold 
  opacity-50 
  hover:opacity-100 
  cursor-pointer
`;
