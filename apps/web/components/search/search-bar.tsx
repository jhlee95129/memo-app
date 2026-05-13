'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  defaultValue?: string;
}

export function SearchBar({ onSearch, defaultValue = '' }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(value);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="메모 검색..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pl-9"
        />
      </div>
      <Button type="submit" variant="secondary">
        검색
      </Button>
    </form>
  );
}
