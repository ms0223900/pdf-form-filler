'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getMaterials } from '@/lib/materialStore';
import type { Material } from '@/lib/types';
import { ArrowLeft, FileText, Fingerprint, Image as ImageIcon, Library, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Tab = 'personal_info' | 'text' | 'image' | 'signature';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'personal_info', label: '個人資料', icon: <User className="size-4" /> },
  { key: 'text', label: '文字', icon: <FileText className="size-4" /> },
  { key: 'image', label: '圖片', icon: <ImageIcon className="size-4" /> },
  { key: 'signature', label: '簽名', icon: <Fingerprint className="size-4" /> },
];

export default function MaterialsPage() {
  const [tab, setTab] = useState<Tab>('personal_info');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getMaterials();
      setMaterials(items);
    } catch {
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const filtered = materials.filter((m) => m.type === tab);
  const hasAny = materials.length > 0;
  const hasInTab = filtered.length > 0;

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          返回
        </Link>
        <span className="flex-1 text-sm font-medium">素材管理</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b px-4 pt-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setTab(t.key)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            載入中...
          </div>
        ) : !hasAny ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <Library className="size-12" />
            <p className="text-sm">尚無任何素材</p>
            <p className="text-xs max-w-xs">
              素材讓你儲存常用的個人資料、文字片段、圖片或簽名，在填寫 PDF 時快速套用。
              請使用對應分頁新增素材。
            </p>
          </div>
        ) : !hasInTab ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <Library className="size-10" />
            <p className="text-sm">此分類尚無素材</p>
            <p className="text-xs">切換到其他分頁瀏覽，或使用對應功能新增素材</p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-2">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {tab === 'image' || tab === 'signature' ? (
                  <div className="size-16 shrink-0 overflow-hidden rounded border bg-muted">
                    <img
                      src={
                        tab === 'signature'
                          ? (m.data as { dataUrl: string }).dataUrl
                          : (m.data as { dataUrl: string }).dataUrl
                      }
                      alt={m.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="size-10 shrink-0 rounded bg-muted p-2 text-muted-foreground">
                    {tab === 'personal_info' ? (
                      <User className="size-full" />
                    ) : (
                      <FileText className="size-full" />
                    )}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {tab === 'personal_info'
                      ? (() => {
                          const d = m.data as Record<string, string>;
                          return [d.name, d.phone, d.email].filter(Boolean).join(' · ');
                        })()
                      : tab === 'text'
                        ? (m.data as { text: string }).text
                        : `${tab === 'image' ? '圖片' : '簽名'}素材`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
