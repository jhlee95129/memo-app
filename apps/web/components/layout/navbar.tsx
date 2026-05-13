'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { UserMenu } from './user-menu';

export function Navbar() {
  return (
    <div className="container flex h-14 items-center justify-between">
      <Link href="/memos" className="flex items-center gap-2 font-bold">
        <Sparkles className="h-5 w-5" />
        AI Memo
      </Link>
      <UserMenu />
    </div>
  );
}
