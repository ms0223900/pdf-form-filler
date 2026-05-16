'use client';

import { AlertTriangle } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
}

export function DeleteConfirmDialog({
  open, onOpenChange, onConfirm, itemName,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            確認刪除
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          確定要刪除「{itemName}」嗎？此操作無法復原。
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            刪除
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
