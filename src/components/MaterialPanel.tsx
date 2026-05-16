'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getMaterials } from '@/lib/materialStore';
import type { Material, TextMaterialData, ImageMaterialData } from '@/lib/types';
import { MaterialCard } from '@/components/MaterialCard';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Library, Loader2, Plus } from 'lucide-react';

interface MaterialPanelProps {
  onApplyPersonalInfo: (data: Record<string, string>) => void;
  onApplySignature: (dataUrl: string) => void;
  onApplyText: (text: string) => void;
  onApplyImage: (dataUrl: string, imageType: 'png' | 'jpeg') => void;
}

export function MaterialPanel({
  onApplyPersonalInfo,
  onApplySignature,
  onApplyText,
  onApplyImage,
}: MaterialPanelProps) {
  const [open, setOpen] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    getMaterials()
      .then((items) => {
        setMaterials(items);
      })
      .catch(() => {
        setMaterials([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open]);

  const handleSelect = useCallback(
    (material: Material) => {
      switch (material.type) {
        case 'personal_info':
          onApplyPersonalInfo(material.data as Record<string, string>);
          break;
        case 'signature': {
          const sig = material.data as { dataUrl: string };
          if (sig.dataUrl) onApplySignature(sig.dataUrl);
          break;
        }
        case 'text': {
          const txt = material.data as TextMaterialData;
          if (txt.text) onApplyText(txt.text);
          break;
        }
        case 'image': {
          const img = material.data as ImageMaterialData;
          if (img.dataUrl) onApplyImage(img.dataUrl, img.imageType);
          break;
        }
      }
      setOpen(false);
    },
    [onApplyPersonalInfo, onApplySignature, onApplyText, onApplyImage]
  );

  const personalInfos = materials.filter((m) => m.type === 'personal_info');
  const texts = materials.filter((m) => m.type === 'text');
  const images = materials.filter((m) => m.type === 'image');
  const signatures = materials.filter((m) => m.type === 'signature');
  const hasAny = materials.length > 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="sm" className="gap-1" />}>
        <Library className="size-4" />
        素材庫
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>素材庫</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : !hasAny ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
              <Library className="size-10" />
              <p className="text-sm">尚無素材</p>
              <p className="text-xs">新增常用的個人資料或簽名，方便快速填入 PDF</p>
              <Link
                href="/materials"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 py-1.5 text-[0.8rem] font-medium text-foreground hover:bg-muted hover:text-foreground"
              >
                <Plus className="size-4" />
                前往新增
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {personalInfos.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    個人資料
                  </h3>
                  <div className="flex flex-col gap-2">
                    {personalInfos.map((m) => (
                      <MaterialCard key={m.id} material={m} onSelect={handleSelect} />
                    ))}
                  </div>
                </section>
              )}

              {texts.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    文字
                  </h3>
                  <div className="flex flex-col gap-2">
                    {texts.map((m) => (
                      <MaterialCard key={m.id} material={m} onSelect={handleSelect} />
                    ))}
                  </div>
                </section>
              )}

              {images.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    圖片
                  </h3>
                  <div className="flex flex-col gap-2">
                    {images.map((m) => (
                      <MaterialCard key={m.id} material={m} onSelect={handleSelect} />
                    ))}
                  </div>
                </section>
              )}

              {signatures.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    簽名
                  </h3>
                  <div className="flex flex-col gap-2">
                    {signatures.map((m) => (
                      <MaterialCard key={m.id} material={m} onSelect={handleSelect} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
