'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { setToken, removeToken } from '@/lib/auth';
import type { LoginInput, RegisterInput } from '@/lib/validations';

interface AuthResponse {
  accessToken: string;
}

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginInput) =>
      apiClient.post<AuthResponse>('/auth/login', data),
    onSuccess: (data) => {
      setToken(data.accessToken);
      toast.success('로그인 성공');
      router.push('/memos');
    },
    onError: (error: Error) => {
      toast.error(error.message || '로그인에 실패했습니다');
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: Omit<RegisterInput, 'confirmPassword'>) =>
      apiClient.post<AuthResponse>('/auth/register', data),
    onSuccess: (data) => {
      setToken(data.accessToken);
      toast.success('회원가입 성공');
      router.push('/memos');
    },
    onError: (error: Error) => {
      toast.error(error.message || '회원가입에 실패했습니다');
    },
  });
}

export function useLogout() {
  const router = useRouter();

  return () => {
    removeToken();
    toast.success('로그아웃 되었습니다');
    router.push('/login');
  };
}
