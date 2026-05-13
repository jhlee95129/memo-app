'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useMemos } from '@/hooks/use-memos';
import { MemoList } from '@/components/memo/memo-list';
import { SearchBar } from '@/components/search/search-bar';
import { TagFilter } from '@/components/search/tag-filter';

export default function MemosPage() {
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const { data: memos, isLoading } = useMemos({
    query: query || undefined,
    tag: selectedTag,
  });

  const allTags = useMemo(() => {
    if (!memos) return [];
    const tagSet = new Set<string>();
    memos.forEach((memo) => memo.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [memos]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 메모</h1>
        <Button asChild>
          <Link href="/memos/new">
            <Plus className="mr-2 h-4 w-4" />
            새 메모
          </Link>
        </Button>
      </div>

      <SearchBar onSearch={setQuery} defaultValue={query} />
      <TagFilter tags={allTags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
      <MemoList memos={memos} isLoading={isLoading} />
    </div>
  );
}
