'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface MemoDeleteDialogProps {
  onConfirm: () => void;
  isPending: boolean;
}

export function MemoDeleteDialog({ onConfirm, isPending }: MemoDeleteDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>메모 삭제</DialogTitle>
          <DialogDescription>
            이 메모를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? '삭제 중...' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
