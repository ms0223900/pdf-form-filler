'use client';

import { useCallback, useRef, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { addMaterial } from '@/lib/materialStore';

interface ImageMaterialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
}

export function ImageMaterialForm({ open, onOpenChange, onSaved }: ImageMaterialFormProps) {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<{ dataUrl: string; imageType: 'png' | 'jpeg' } | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setName('');
    setImageFile(null);
    setSaving(false);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageType = file.type === 'image/png' ? 'png' : 'jpeg';
    setSaving(true);
    const reader = new FileReader();
    reader.onload = () => {
      setImageFile({ dataUrl: reader.result as string, imageType });
      setSaving(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim() || !imageFile) return;
    await addMaterial({
      name: name.trim(),
      type: 'image',
      data: imageFile,
    });
    reset();
    onOpenChange(false);
    await onSaved();
  }, [name, imageFile, reset, onSaved, onOpenChange]);

  const handleClose = useCallback((next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  }, [reset, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新增圖片素材</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="imageName">素材名稱</Label>
            <Input
              id="imageName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：公司印章"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label>圖片檔案</Label>
            {imageFile ? (
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="size-16 shrink-0 overflow-hidden rounded border bg-muted">
                  <img src={imageFile.dataUrl} alt="預覽" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {imageFile.imageType === 'png' ? 'PNG' : 'JPG'} 圖片已選取
                  </p>
                </div>
                <Button variant="ghost" size="xs" onClick={() => setImageFile(null)}>
                  重新選擇
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => inputRef.current?.click()}
                  disabled={saving}
                  className="gap-2 py-8"
                >
                  {saving ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Upload className="size-5" />
                  )}
                  {saving ? '讀取中...' : '選擇圖片檔案'}
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => handleClose(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || !imageFile}>
              儲存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
