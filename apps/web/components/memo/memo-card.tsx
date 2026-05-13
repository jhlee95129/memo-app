'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Memo } from '@/hooks/use-memos';

interface MemoCardProps {
  memo: Memo;
}

export function MemoCard({ memo }: MemoCardProps) {
  return (
    <Link href={`/memos/${memo._id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-1">{memo.title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {new Date(memo.createdAt).toLocaleDateString('ko-KR')}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {memo.summary ?? memo.content}
          </p>
          {memo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {memo.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
