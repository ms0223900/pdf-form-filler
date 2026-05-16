'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getMaterials, addMaterial, updateMaterial, deleteMaterial } from '@/lib/materialStore';
import type { ImageMaterialData, Material, PersonalInfo } from '@/lib/types';
import { PersonalInfoForm } from '@/components/PersonalInfoForm';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertTriangle, ArrowLeft, FileText, Fingerprint, Image as ImageIcon,
  Library, Loader2, Pencil, Plus, Trash2, Upload, User,
} from 'lucide-react';

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

  // Personal info form state
  const [formOpen, setFormOpen] = useState(false);
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);

  // Text add form state
  const [textFormOpen, setTextFormOpen] = useState(false);
  const [textName, setTextName] = useState('');
  const [textContent, setTextContent] = useState('');

  // Image add form state
  const [imageFormOpen, setImageFormOpen] = useState(false);
  const [imageName, setImageName] = useState('');
  const [imageFile, setImageFile] = useState<{ dataUrl: string; imageType: 'png' | 'jpeg' } | null>(null);
  const [imageSaving, setImageSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  // ---- Personal Info CRUD ----

  const handleAdd = useCallback(() => {
    setEditMaterial(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((m: Material) => {
    setEditMaterial(m);
    setFormOpen(true);
  }, []);

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
      setFormOpen(false);
      setEditMaterial(null);
      await loadMaterials();
    },
    [editMaterial, loadMaterials]
  );

  // ---- Text CRUD ----

  const handleTextAdd = useCallback(() => {
    setTextName('');
    setTextContent('');
    setTextFormOpen(true);
  }, []);

  const handleTextSave = useCallback(async () => {
    if (!textName.trim() || !textContent.trim()) return;
    await addMaterial({
      name: textName.trim(),
      type: 'text',
      data: { text: textContent.trim() },
    });
    setTextFormOpen(false);
    await loadMaterials();
  }, [textName, textContent, loadMaterials]);

  // ---- Image CRUD ----

  const handleImageAdd = useCallback(() => {
    setImageName('');
    setImageFile(null);
    setImageFormOpen(true);
  }, []);

  const handleImageFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const imageType = file.type === 'image/png' ? 'png' : 'jpeg';
      setImageSaving(true);
      const reader = new FileReader();
      reader.onload = () => {
        setImageFile({ dataUrl: reader.result as string, imageType });
        setImageSaving(false);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    []
  );

  const handleImageSave = useCallback(async () => {
    if (!imageName.trim() || !imageFile) return;
    await addMaterial({
      name: imageName.trim(),
      type: 'image',
      data: imageFile,
    });
    setImageFormOpen(false);
    setImageFile(null);
    await loadMaterials();
  }, [imageName, imageFile, loadMaterials]);

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
          <Button variant="outline" size="sm" onClick={handleTextAdd} className="mt-1 gap-1">
            <Plus className="size-4" />
            新增文字素材
          </Button>
        );
      case 'image':
        return (
          <Button variant="outline" size="sm" onClick={handleImageAdd} className="mt-1 gap-1">
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
      case 'text': return handleTextAdd;
      case 'image': return handleImageAdd;
      default: return undefined;
    }
  };

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

      {/* PersonalInfo Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
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
            onCancel={() => {
              setFormOpen(false);
              setEditMaterial(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Text Add Dialog */}
      <Dialog open={textFormOpen} onOpenChange={setTextFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新增文字素材</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="textName">素材名稱</Label>
              <Input
                id="textName"
                value={textName}
                onChange={(e) => setTextName(e.target.value)}
                placeholder="例如：公司地址"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="textContent">文字內容</Label>
              <textarea
                id="textContent"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="輸入要儲存的文字內容..."
                rows={4}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setTextFormOpen(false)}>
                取消
              </Button>
              <Button onClick={handleTextSave} disabled={!textName.trim() || !textContent.trim()}>
                儲存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Add Dialog */}
      <Dialog open={imageFormOpen} onOpenChange={setImageFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新增圖片素材</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="imageName">素材名稱</Label>
              <Input
                id="imageName"
                value={imageName}
                onChange={(e) => setImageName(e.target.value)}
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
                    onClick={() => imageInputRef.current?.click()}
                    disabled={imageSaving}
                    className="gap-2 py-8"
                  >
                    {imageSaving ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Upload className="size-5" />
                    )}
                    {imageSaving ? '讀取中...' : '選擇圖片檔案'}
                  </Button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setImageFormOpen(false)}>
                取消
              </Button>
              <Button onClick={handleImageSave} disabled={!imageName.trim() || !imageFile}>
                儲存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              確認刪除
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            確定要刪除「{deleteTarget?.name}」嗎？此操作無法復原。
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              刪除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
