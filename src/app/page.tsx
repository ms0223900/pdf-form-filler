'use client';

import { useEffect, useState } from 'react';
import { DashboardCard } from '@/components/DashboardCard';
import { PDFUploader } from '@/components/PDFUploader';
import { PresetTemplates } from '@/components/PresetTemplates';
import { db } from '@/lib/db';
import type { PDFDocument } from '@/lib/types';
import { FileText } from 'lucide-react';

export default function Home() {
  const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPdfs() {
    setLoading(true);
    const list = await db.pdfs.toArray();
    setPdfs(list);
    setLoading(false);
  }

  useEffect(() => {
    loadPdfs();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          PDF Form Filler
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          上傳 PDF 表單，在瀏覽器中直接填寫
        </p>
      </div>

      {/* Uploader */}
      <PDFUploader onUpload={loadPdfs} />

      {/* Preset Templates */}
      <PresetTemplates />

      {/* PDF List */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          已上傳的表單
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            載入中...
          </div>
        ) : pdfs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
            <FileText className="mb-2 size-8" />
            <p>尚未上傳任何 PDF</p>
            <p className="text-xs">上傳表單後即可開始填寫</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {pdfs.map((pdf) => (
              <DashboardCard
                key={pdf.id}
                id={pdf.id!}
                name={pdf.name}
                uploadedAt={pdf.uploadedAt}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
