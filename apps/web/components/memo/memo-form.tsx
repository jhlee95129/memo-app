'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createMemoSchema, type CreateMemoInput } from '@/lib/validations';

interface MemoFormProps {
  defaultValues?: { title: string; content: string };
  onSubmit: (data: CreateMemoInput) => void;
  isPending: boolean;
  submitLabel: string;
}

export function MemoForm({ defaultValues, onSubmit, isPending, submitLabel }: MemoFormProps) {
  const form = useForm<CreateMemoInput>({
    resolver: zodResolver(createMemoSchema),
    defaultValues: defaultValues ?? { title: '', content: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input placeholder="메모 제목" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>내용</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="메모 내용을 입력하세요..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? '저장 중...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
