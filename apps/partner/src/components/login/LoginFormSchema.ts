import { z } from 'zod';

export const LoginFormSchema = z.object({
  email: z.string().email('이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
  partnerType: z.enum(['BRAND', 'INFLUENCER']),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;
