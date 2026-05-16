'use client';

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { MaterialsManager } from '@/components/MaterialsManager';

interface MaterialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaterialsDialog({ open, onOpenChange }: MaterialsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed inset-0 z-50 flex h-full w-full max-w-none flex-col rounded-none bg-background p-0 data-closed:animate-out data-closed:fade-out-0"
        showCloseButton={false}
      >
        <MaterialsManager onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
