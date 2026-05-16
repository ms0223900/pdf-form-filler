'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface PersonalInfoFormProps {
  initialData?: Record<string, string>;
  onSave: (data: { name: string; fields: Record<string, string> }) => Promise<void>;
  onCancel: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  name: '姓名',
  phone: '電話',
  email: 'Email',
  address: '地址',
  taxId: '統編',
};

const FIELD_KEYS = ['name', 'phone', 'email', 'address', 'taxId'];

export function PersonalInfoForm({ initialData, onSave, onCancel }: PersonalInfoFormProps) {
  const [materialName, setMaterialName] = useState(initialData?.materialName ?? '');
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const key of FIELD_KEYS) {
      init[key] = initialData?.[key] ?? '';
    }
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFieldChange = useCallback(
    (key: string, value: string) => {
      setFields((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!materialName.trim()) {
        setError('請輸入素材名稱');
        return;
      }
      setSaving(true);
      setError(null);
      try {
        await onSave({ name: materialName.trim(), fields: { ...fields } });
      } catch {
        setError('儲存失敗');
      } finally {
        setSaving(false);
      }
    },
    [materialName, fields, onSave]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="materialName">素材名稱</Label>
        <Input
          id="materialName"
          value={materialName}
          onChange={(e) => setMaterialName(e.target.value)}
          placeholder="例如：我的基本資料"
          className="text-sm"
        />
      </div>

      {FIELD_KEYS.map((key) => (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={key}>{FIELD_LABELS[key]}</Label>
          <Input
            id={key}
            value={fields[key]}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            placeholder={`輸入${FIELD_LABELS[key]}`}
            className="text-sm"
          />
        </div>
      ))}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          取消
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {initialData ? '更新' : '儲存'}
        </Button>
      </div>
    </form>
  );
}
