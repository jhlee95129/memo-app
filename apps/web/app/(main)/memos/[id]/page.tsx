'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useMemoDetail } from '@/hooks/use-memos';
import { useDeleteMemo } from '@/hooks/use-memo-mutations';
import { AiSummaryCard } from '@/components/memo/ai-summary-card';
import { MemoDeleteDialog } from '@/components/memo/memo-delete-dialog';

export default function MemoDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: memo, isLoading } = useMemoDetail(params.id);
  const deleteMemo = useDeleteMemo();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!memo) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">메모를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/memos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              뒤로
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/memos/${memo._id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              수정
            </Link>
          </Button>
          <MemoDeleteDialog
            onConfirm={() => deleteMemo.mutate(memo._id)}
            isPending={deleteMemo.isPending}
          />
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{memo.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date(memo.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      <AiSummaryCard summary={memo.summary} tags={memo.tags} />

      <Separator />

      <div className="prose prose-neutral max-w-none">
        <p className="whitespace-pre-wrap">{memo.content}</p>
      </div>
    </div>
  );
}
