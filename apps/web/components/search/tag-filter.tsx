'use client';

import { Badge } from '@/components/ui/badge';

interface TagFilterProps {
  tags: string[];
  selectedTag: string | undefined;
  onSelectTag: (tag: string | undefined) => void;
}

export function TagFilter({ tags, selectedTag, onSelectTag }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={!selectedTag ? 'default' : 'outline'}
        className="cursor-pointer"
        onClick={() => onSelectTag(undefined)}
      >
        전체
      </Badge>
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={selectedTag === tag ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => onSelectTag(selectedTag === tag ? undefined : tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
