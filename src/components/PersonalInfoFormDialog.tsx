'use client';

import { useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { PersonalInfoForm } from '@/components/PersonalInfoForm';
import { addMaterial, updateMaterial } from '@/lib/materialStore';
import type { Material, PersonalInfo } from '@/lib/types';

interface PersonalInfoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
  editMaterial: Material | null;
}

export function PersonalInfoFormDialog({
  open, onOpenChange, onSaved, editMaterial,
}: PersonalInfoFormDialogProps) {
  const handleSave = useCallback(
    async (data: { name: string; fields: Record<string, string> }) => {
      if (editMaterial) {
        await updateMaterial(editMaterial.id!, {
          name: data.name,
          data: data.fields as PersonalInfo,
        });
      } else {
        await addMaterial({
          name: data.name,
          type: 'personal_info',
          data: data.fields as PersonalInfo,
        });
      }
      onOpenChange(false);
      await onSaved();
    },
    [editMaterial, onSaved, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editMaterial ? '編輯個人資料' : '新增個人資料'}</DialogTitle>
        </DialogHeader>
        <PersonalInfoForm
          initialData={
            editMaterial
              ? { materialName: editMaterial.name, ...(editMaterial.data as Record<string, string>) }
              : undefined
          }
          onSave={handleSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
