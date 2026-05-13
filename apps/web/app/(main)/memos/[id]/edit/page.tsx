'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { useMemoDetail } from '@/hooks/use-memos';
import { useUpdateMemo } from '@/hooks/use-memo-mutations';
import { MemoForm } from '@/components/memo/memo-form';

export default function EditMemoPage() {
  const params = useParams<{ id: string }>();
  const { data: memo, isLoading } = useMemoDetail(params.id);
  const updateMemo = useUpdateMemo(params.id);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/memos/${memo._id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">메모 수정</h1>
      </div>
      <MemoForm
        defaultValues={{ title: memo.title, content: memo.content }}
        onSubmit={(data) => updateMemo.mutate(data)}
        isPending={updateMemo.isPending}
        submitLabel="저장"
      />
    </div>
  );
}
