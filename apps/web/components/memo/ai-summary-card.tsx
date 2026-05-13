'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sparkles } from 'lucide-react';

interface AiSummaryCardProps {
  summary: string | null;
  tags: string[];
}

export function AiSummaryCard({ summary, tags }: AiSummaryCardProps) {
  if (!summary && tags.length === 0) return null;

  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI 분석
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {summary && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">요약</p>
            <p className="text-sm">{summary}</p>
          </div>
        )}
        {summary && tags.length > 0 && <Separator />}
        {tags.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">태그</p>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
