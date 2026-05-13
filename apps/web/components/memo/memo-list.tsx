'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { MemoCard } from './memo-card';
import type { Memo } from '@/hooks/use-memos';

interface MemoListProps {
  memos: Memo[] | undefined;
  isLoading: boolean;
}

export function MemoList({ memos, isLoading }: MemoListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!memos || memos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">메모가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {memos.map((memo) => (
        <MemoCard key={memo._id} memo={memo} />
      ))}
    </div>
  );
}
