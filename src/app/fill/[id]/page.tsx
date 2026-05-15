'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { db } from '@/lib/db';
import { detectFormFields } from '@/lib/pdfUtils';
import type { PDFDocument, PDFField } from '@/lib/types';
import { ArrowLeft, FileWarning } from 'lucide-react';
import Link from 'next/link';

const PDFViewer = dynamic(
  () => import('@/components/PDFViewer').then((mod) => mod.PDFViewer),
  { ssr: false }
);

const FormFieldPanel = dynamic(
  () => import('@/components/FormFieldPanel').then((mod) => mod.FormFieldPanel),
  { ssr: false }
);

export default function FillPage() {
  const params = useParams<{ id: string }>();
  const [pdf, setPdf] = useState<PDFDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<PDFField[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [values, setValues] = useState<Record<string, string | boolean>>({});

  useEffect(() => {
    const id = Number(params.id);
    if (!id) {
      setError('無效的 PDF');
      setLoading(false);
      return;
    }

    db.pdfs
      .get(id)
      .then((result) => {
        if (!result) {
          setError('找不到此 PDF');
        } else {
          setPdf(result);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('讀取 PDF 失敗');
        setLoading(false);
      });
  }, [params.id]);

  useEffect(() => {
    if (!pdf) return;

    setFieldsLoading(true);
    detectFormFields(pdf.fileData)
      .then((detected) => {
        setFields(detected);
        // Init values from detected fields
        const init: Record<string, string | boolean> = {};
        for (const f of detected) {
          if (f.type === 'checkbox') {
            init[f.name] = false;
          } else if (f.value !== undefined) {
            init[f.name] = f.value;
          } else {
            init[f.name] = '';
          }
        }
        setValues(init);
      })
      .catch(() => {
        setFields([]);
      })
      .finally(() => {
        setFieldsLoading(false);
      });
  }, [pdf]);

  const handleFieldChange = useCallback(
    (name: string, value: string | boolean) => {
      setValues((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        載入中...
      </div>
    );
  }

  if (error || !pdf) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <FileWarning className="size-8" />
        <p>{error || '無法載入 PDF'}</p>
        <Link
          href="/"
          className="text-primary underline-offset-4 hover:underline"
        >
          返回儀表板
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          返回
        </Link>
        <span className="text-sm font-medium">{pdf.name}</span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* Left: PDF Viewer */}
        <div className="flex-1 overflow-hidden md:w-1/2">
          <PDFViewer file={pdf.fileData} />
        </div>

        {/* Right: Field Panel */}
        <div className="overflow-y-auto border-t bg-background md:w-1/2 md:border-t-0 md:border-l">
          {fieldsLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              解析表單欄位...
            </div>
          ) : (
            <FormFieldPanel
              fields={fields}
              values={values}
              onChange={handleFieldChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
