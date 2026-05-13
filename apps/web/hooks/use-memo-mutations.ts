'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { memoKeys, type Memo } from '@/hooks/use-memos';
import type { CreateMemoInput, UpdateMemoInput } from '@/lib/validations';

export function useCreateMemo() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateMemoInput) =>
      apiClient.post<Memo>('/memos', data),
    onSuccess: (memo) => {
      queryClient.invalidateQueries({ queryKey: memoKeys.lists() });
      toast.success('메모가 작성되었습니다');
      router.push(`/memos/${memo._id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || '메모 작성에 실패했습니다');
    },
  });
}

export function useUpdateMemo(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: UpdateMemoInput) =>
      apiClient.patch<Memo>(`/memos/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memoKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: memoKeys.lists() });
      toast.success('메모가 수정되었습니다');
      router.push(`/memos/${id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || '메모 수정에 실패했습니다');
    },
  });
}

export function useDeleteMemo() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/memos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memoKeys.lists() });
      toast.success('메모가 삭제되었습니다');
      router.push('/memos');
    },
    onError: (error: Error) => {
      toast.error(error.message || '메모 삭제에 실패했습니다');
    },
  });
}
