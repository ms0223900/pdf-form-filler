'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getMaterials, deleteMaterial } from '@/lib/materialStore';
import type { ImageMaterialData, Material } from '@/lib/types';
import { PersonalInfoFormDialog } from '@/components/PersonalInfoFormDialog';
import { TextMaterialForm } from '@/components/TextMaterialForm';
import { ImageMaterialForm } from '@/components/ImageMaterialForm';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, FileText, Fingerprint, Image as ImageIcon, Library, Pencil, Plus, Trash2, User, X,
} from 'lucide-react';

type Tab = 'personal_info' | 'text' | 'image' | 'signature';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'personal_info', label: '個人資料', icon: <User className="size-4" /> },
  { key: 'text', label: '文字', icon: <FileText className="size-4" /> },
  { key: 'image', label: '圖片', icon: <ImageIcon className="size-4" /> },
  { key: 'signature', label: '簽名', icon: <Fingerprint className="size-4" /> },
];

interface MaterialsManagerProps {
  onClose?: () => void;
}

export function MaterialsManager({ onClose }: MaterialsManagerProps) {
  const [tab, setTab] = useState<Tab>('personal_info');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  // Personal info dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);

  // Text & image dialog open state
  const [textFormOpen, setTextFormOpen] = useState(false);
  const [imageFormOpen, setImageFormOpen] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);

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

  // ---- Personal info CRUD ----

  const handleAdd = useCallback(() => {
    setEditMaterial(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((m: Material) => {
    setEditMaterial(m);
    setFormOpen(true);
  }, []);

  // ---- Delete ----

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget?.id) return;
    await deleteMaterial(deleteTarget.id);
    setDeleteTarget(null);
    await loadMaterials();
  }, [deleteTarget, loadMaterials]);

  // ---- Render helpers ----

  const filtered = materials.filter((m) => m.type === tab);
  const hasAny = materials.length > 0;
  const hasInTab = filtered.length > 0;
  const showAddButton = tab !== 'signature';

  const renderList = () => {
    if (tab === 'personal_info') {
      return (
        <div className="mx-auto max-w-2xl space-y-2">
          {filtered.map((m) => {
            const d = m.data as Record<string, string>;
            const summary = [d.name, d.phone, d.email].filter(Boolean).join(' · ');
            return (
              <ItemRow key={m.id} icon={<User className="size-full" />}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {summary || '無內容'}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <ActionBtn icon={<Pencil className="size-4" />} title="編輯" onClick={() => handleEdit(m)} />
                  <ActionBtn icon={<Trash2 className="size-4" />} title="刪除" onClick={() => setDeleteTarget(m)} destructive />
                </div>
              </ItemRow>
            );
          })}
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-2xl space-y-2">
        {filtered.map((m) => {
          const isImageType = tab === 'image' || tab === 'signature';
          return (
            <ItemRow
              key={m.id}
              icon={
                isImageType ? (
                  <img
                    src={(m.data as ImageMaterialData).dataUrl}
                    alt={m.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <FileText className="size-full" />
                )
              }
              iconClass={isImageType ? 'p-0 overflow-hidden' : ''}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {tab === 'text'
                    ? (m.data as { text: string }).text
                    : tab === 'image'
                      ? `${(m.data as ImageMaterialData).imageType === 'png' ? 'PNG' : 'JPG'} 圖片`
                      : '簽名素材'}
                </p>
              </div>
              <ActionBtn icon={<Trash2 className="size-4" />} title="刪除" onClick={() => setDeleteTarget(m)} destructive />
            </ItemRow>
          );
        })}
      </div>
    );
  };

  const renderEmptyAction = () => {
    switch (tab) {
      case 'personal_info':
        return (
          <Button variant="outline" size="sm" onClick={handleAdd} className="mt-1 gap-1">
            <Plus className="size-4" />
            新增個人資料
          </Button>
        );
      case 'text':
        return (
          <Button variant="outline" size="sm" onClick={() => setTextFormOpen(true)} className="mt-1 gap-1">
            <Plus className="size-4" />
            新增文字素材
          </Button>
        );
      case 'image':
        return (
          <Button variant="outline" size="sm" onClick={() => setImageFormOpen(true)} className="mt-1 gap-1">
            <Plus className="size-4" />
            新增圖片素材
          </Button>
        );
      default:
        return null;
    }
  };

  const handleAddButton = () => {
    switch (tab) {
      case 'personal_info': return handleAdd;
      case 'text': return () => setTextFormOpen(true);
      case 'image': return () => setImageFormOpen(true);
      default: return undefined;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-4 py-2">
        {onClose ? (
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
            關閉
          </button>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            返回
          </Link>
        )}
        <span className="flex-1 text-sm font-medium">素材管理</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b pr-4">
        <div className="flex gap-1 px-4 pt-2">
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
        {showAddButton && hasInTab && (
          <Button variant="outline" size="sm" onClick={handleAddButton()} className="gap-1">
            <Plus className="size-4" />
            新增
          </Button>
        )}
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
            </p>
            {renderEmptyAction()}
          </div>
        ) : !hasInTab ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <Library className="size-10" />
            <p className="text-sm">此分類尚無素材</p>
            {renderEmptyAction()}
          </div>
        ) : (
          renderList()
        )}
      </div>

      {/* Dialogs */}
      <PersonalInfoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={loadMaterials}
        editMaterial={editMaterial}
      />
      <TextMaterialForm
        open={textFormOpen}
        onOpenChange={setTextFormOpen}
        onSaved={loadMaterials}
      />
      <ImageMaterialForm
        open={imageFormOpen}
        onOpenChange={setImageFormOpen}
        onSaved={loadMaterials}
      />
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deleteTarget?.name ?? ''}
      />
    </div>
  );
}

// ---- Sub-components ----

function ItemRow({
  icon,
  iconClass,
  children,
}: {
  icon: React.ReactNode;
  iconClass?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className={`size-10 shrink-0 rounded bg-muted p-2 text-muted-foreground ${iconClass ?? ''}`}>
        {icon}
      </div>
      {children}
    </div>
  );
}

function ActionBtn({
  icon,
  title,
  onClick,
  destructive,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      className={`flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors ${
        destructive
          ? 'hover:bg-destructive/10 hover:text-destructive'
          : 'hover:bg-muted hover:text-foreground'
      }`}
      onClick={onClick}
      title={title}
    >
      {icon}
    </button>
  );
}
