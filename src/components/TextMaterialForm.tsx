'use client';

import { useCallback, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { addMaterial } from '@/lib/materialStore';

interface TextMaterialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
}

export function TextMaterialForm({ open, onOpenChange, onSaved }: TextMaterialFormProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  const reset = useCallback(() => {
    setName('');
    setContent('');
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim() || !content.trim()) return;
    await addMaterial({
      name: name.trim(),
      type: 'text',
      data: { text: content.trim() },
    });
    reset();
    onOpenChange(false);
    await onSaved();
  }, [name, content, reset, onSaved, onOpenChange]);

  const handleClose = useCallback((next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  }, [reset, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新增文字素材</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="textName">素材名稱</Label>
            <Input
              id="textName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：公司地址"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="textContent">文字內容</Label>
            <Textarea
              id="textContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="輸入要儲存的文字內容..."
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => handleClose(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || !content.trim()}>
              儲存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
