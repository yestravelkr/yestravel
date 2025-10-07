import { Link } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

export const FormContainer = tw.div`
  w-full
  mx-auto
`;

export const Form = tw.form`
  space-y-6
`;

export const FormColumns = tw.div`
  flex
  max-w-6xl
  justify-center
  mx-auto
  gap-6
`;

export const LeftColumn = tw.div`
  space-y-6
  lg:col-span-3
`;

export const RightColumn = tw.div`
  space-y-6
  lg:col-span-2
`;

export const FormRow = tw.div`
  grid
  grid-cols-1
  gap-4
  sm:grid-cols-2
`;

export const Label = tw.label`
  block
  text-sm
  font-medium
  text-gray-700
`;

export const Select = tw.select`
  block
  w-full
  px-3
  py-2
  border
  border-gray-300
  rounded-md
  shadow-sm
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-blue-500
  sm:text-sm
`;

export const FieldHint = tw.p`
  mt-1
  text-sm
  text-gray-500
`;

export const ThumbnailGrid = tw.div`
  grid
  grid-cols-1
  gap-4
  sm:grid-cols-2
`;

export const ThumbnailCard = tw.div`
  rounded-lg
  border
  border-gray-200
  bg-white
  shadow-sm
  overflow-hidden
`;

export const ThumbnailPreview = tw.img`
  w-full
  h-40
  object-cover
  bg-gray-100
`;

export const ThumbnailActions = tw.div`
  flex
  items-center
  justify-between
  px-4
  py-2
  text-sm
  text-gray-700
`;

export const FileUploadCard = tw.div`
  flex
  flex-col
  gap-2
`;

export const ThumbnailRemoveButton = tw.button`
  px-3
  py-1
  text-xs
  text-red-600
  hover:text-red-800
  border
  border-red-200
  hover:border-red-300
  rounded
  transition-colors
`;

export const FormActions = tw.div`
  flex
  justify-end
  space-x-3
  pt-6
  border-t
  border-gray-200
`;

export const CancelButton = tw(Link)`
  px-4
  py-2
  text-gray-700
  bg-white
  border
  border-gray-300
  rounded-lg
  hover:bg-gray-50
  transition-colors
  font-medium
`;

export const SecondaryButton = tw.button`
  px-4
  py-2
  text-gray-700
  bg-white
  border
  border-gray-300
  rounded-lg
  hover:bg-gray-50
  transition-colors
  font-medium
`;

export const PrimaryButton = tw.button`
  px-4
  py-2
  bg-blue-600
  text-white
  rounded-lg
  hover:bg-blue-700
  transition-colors
  font-medium
`;
