import { z } from 'zod';

export const createStaffInputSchema = z.object({
  email: z.string().email('이메일 형식이 아닙니다.'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
  name: z.string().min(1, '이름은 필수입니다.'),
  phoneNumber: z.string().min(1, '전화번호는 필수입니다.'),
});

export const deleteStaffInputSchema = z.object({
  id: z.number(),
});

export const staffItemSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  role: z.string(),
  createdAt: z.date(),
});

export const profileOutputSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  role: z.string(),
  partnerType: z.string(),
  partnerId: z.number(),
});
