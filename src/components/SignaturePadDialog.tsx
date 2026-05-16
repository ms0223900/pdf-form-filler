'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SignaturePad, type SignaturePadHandle } from './SignaturePad';
import { addMaterial, getMaterials } from '@/lib/materialStore';
import { Pen, Plus } from 'lucide-react';
import type { Material, SignatureData } from '@/lib/types';

interface SignaturePadDialogProps {
  currentPage: number;
  pageWidth: number;
  pageHeight: number;
  onAddSignature: (page: number, pageW: number, pageH: number, dataUrl: string) => void;
}

const PEN_SIZES = [
  { label: '細', value: 1 },
  { label: '中', value: 2 },
  { label: '粗', value: 4 },
  { label: '特粗', value: 6 },
];

export function SignaturePadDialog({
  currentPage,
  pageWidth,
  pageHeight,
  onAddSignature,
}: SignaturePadDialogProps) {
  const [open, setOpen] = useState(false);
  const [penSize, setPenSize] = useState(2);
  const [tab, setTab] = useState<'draw' | 'library'>('draw');
  const [savedSignatures, setSavedSignatures] = useState<Material[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<number | null>(null);
  const [saveToLibrary, setSaveToLibrary] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const sigRef = useRef<SignaturePadHandle>(null);

  const loadSavedSignatures = useCallback(async () => {
    try {
      const sigs = await getMaterials('signature');
      setSavedSignatures(sigs);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadSavedSignatures();
      setTab('draw');
      setSelectedSavedId(null);
      setSaveToLibrary(false);
      setSignatureName('');
    }
  }, [open, loadSavedSignatures]);

  const handleClear = useCallback(() => {
    sigRef.current?.clear();
  }, []);

  const handleUseSignature = useCallback(async () => {
    if (tab === 'draw') {
      const dataUrl = sigRef.current?.toDataURL();
      if (!dataUrl || sigRef.current?.isEmpty()) return;

      onAddSignature(currentPage, pageWidth, pageHeight, dataUrl);

      if (saveToLibrary && signatureName.trim()) {
        try {
          await addMaterial({
            name: signatureName.trim(),
            type: 'signature',
            data: { dataUrl },
          });
        } catch {
          // silently fail
        }
      }
    } else {
      const selected = savedSignatures.find((s) => s.id === selectedSavedId);
      if (!selected || selected.type !== 'signature') return;

      onAddSignature(
        currentPage,
        pageWidth,
        pageHeight,
        (selected.data as SignatureData).dataUrl
      );
    }

    setOpen(false);
  }, [
    tab,
    currentPage,
    pageWidth,
    pageHeight,
    onAddSignature,
    saveToLibrary,
    signatureName,
    savedSignatures,
    selectedSavedId,
  ]);

  const canSave =
    tab === 'draw'
      ? !sigRef.current?.isEmpty()
      : selectedSavedId !== null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1">
            <Pen className="size-4" />
            簽名
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>簽名工具</DialogTitle>
        </DialogHeader>

        {/* Tab bar */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === 'draw'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setTab('draw')}
          >
            繪製新簽名
          </button>
          <button
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === 'library'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setTab('library')}
          >
            從素材庫選取
          </button>
        </div>

        {tab === 'draw' ? (
          <>
            {/* Pen size selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">畫筆粗細：</span>
              {PEN_SIZES.map((s) => (
                <button
                  key={s.value}
                  className={`rounded-md px-3 py-1 text-sm transition-colors ${
                    penSize === s.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setPenSize(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Signature canvas */}
            <div className="h-48">
              <SignaturePad ref={sigRef} penSize={penSize} />
            </div>

            {/* Clear button */}
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleClear}>
                清除重畫
              </Button>
            </div>

            {/* Save to library option */}
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveToLibrary"
                  checked={saveToLibrary}
                  onChange={(e) => setSaveToLibrary(e.target.checked)}
                  className="size-4 rounded border-gray-300"
                />
                <Label htmlFor="saveToLibrary" className="text-sm">
                  儲存至素材庫
                </Label>
              </div>
              {saveToLibrary && (
                <div>
                  <Input
                    placeholder="簽名名稱（例如：我的簽名）"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className="text-sm"
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Library tab */}
            <p className="text-sm text-muted-foreground">
              選擇一個已儲存的簽名：
            </p>
            {savedSignatures.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
                <Pen className="size-8" />
                <p>尚無已儲存的簽名</p>
                <p className="text-xs">
                  請先切換至「繪製新簽名」分頁建立簽名並儲存
                </p>
              </div>
            ) : (
              <div className="grid max-h-48 grid-cols-3 gap-3 overflow-y-auto">
                {savedSignatures.map((sig) => {
                  const isSelected = sig.id === selectedSavedId;
                  return (
                    <button
                      key={sig.id}
                      className={`relative flex aspect-[3/1] items-center justify-center overflow-hidden rounded-lg border p-2 transition-colors ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-muted hover:border-muted-foreground/30'
                      }`}
                      onClick={() => setSelectedSavedId(sig.id ?? null)}
                    >
                      {sig.type === 'signature' && (
                        <img
                          src={(sig.data as SignatureData).dataUrl}
                          alt={sig.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      )}
                      {isSelected && (
                        <div className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {savedSignatures.length > 0 && (
              <p className="text-xs text-muted-foreground">
                共 {savedSignatures.length} 個簽名
              </p>
            )}
          </>
        )}

        {/* Bottom actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleUseSignature} disabled={!canSave}>
            <Plus className="mr-1 size-4" />
            使用簽名
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
