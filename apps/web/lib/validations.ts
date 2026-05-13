import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export const registerSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

export const createMemoSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
});

export const updateMemoSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').optional(),
  content: z.string().min(1, '내용을 입력해주세요').optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateMemoInput = z.infer<typeof createMemoSchema>;
export type UpdateMemoInput = z.infer<typeof updateMemoSchema>;
