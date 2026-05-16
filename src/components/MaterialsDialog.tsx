'use client';

import { MaterialsManager } from '@/components/MaterialsManager';
import { useEffect, useRef } from 'react';

interface MaterialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaterialsDialog({ open, onOpenChange }: MaterialsDialogProps) {
  const prevFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      prevFocusRef.current = document.activeElement as HTMLElement;
    } else if (prevFocusRef.current) {
      prevFocusRef.current?.focus();
      prevFocusRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="relative flex h-full w-full flex-col bg-background">
        <MaterialsManager onClose={() => onOpenChange(false)} />
      </div>
    </div>
  );
}
