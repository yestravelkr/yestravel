import tw from 'tailwind-styled-components';
import {TDInput, type TDInputProps} from "./input";
import {TDDefault} from "./base";
export {TH} from './base';

export const TD = Object.assign(TDDefault, {
  Input: TDInput
});

export type { TDInputProps };