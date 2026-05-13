'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Memo {
  _id: string;
  title: string;
  content: string;
  summary: string | null;
  tags: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const memoKeys = {
  all: ['memos'] as const,
  lists: () => [...memoKeys.all, 'list'] as const,
  list: (filters: Record<string, string>) => [...memoKeys.lists(), filters] as const,
  details: () => [...memoKeys.all, 'detail'] as const,
  detail: (id: string) => [...memoKeys.details(), id] as const,
};

export function useMemos(filters?: { query?: string; tag?: string }) {
  const params = new URLSearchParams();
  if (filters?.query) params.set('query', filters.query);
  if (filters?.tag) params.set('tag', filters.tag);
  const queryString = params.toString();
  const endpoint = queryString ? `/memos/search?${queryString}` : '/memos';

  return useQuery({
    queryKey: memoKeys.list(filters ?? {}),
    queryFn: () => apiClient.get<Memo[]>(endpoint),
  });
}

export function useMemoDetail(id: string) {
  return useQuery({
    queryKey: memoKeys.detail(id),
    queryFn: () => apiClient.get<Memo>(`/memos/${id}`),
    enabled: !!id,
  });
}
