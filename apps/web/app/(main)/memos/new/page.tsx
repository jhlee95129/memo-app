'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MemoForm } from '@/components/memo/memo-form';
import { useCreateMemo } from '@/hooks/use-memo-mutations';

export default function NewMemoPage() {
  const createMemo = useCreateMemo();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/memos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">새 메모</h1>
      </div>
      <MemoForm
        onSubmit={(data) => createMemo.mutate(data)}
        isPending={createMemo.isPending}
        submitLabel="작성"
      />
    </div>
  );
}
