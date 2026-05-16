'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { db } from '@/lib/db';
import type { PDFDocument } from '@/lib/types';
import { ExportButton } from '@/components/ExportButton';
import { useCustomBlocks } from '@/hooks/useCustomBlocks';
import { SignaturePadDialog } from '@/components/SignaturePadDialog';
import { ArrowLeft, FileWarning, Image, Type } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const PDFViewer = dynamic(
  () => import('@/components/PDFViewer').then((mod) => mod.PDFViewer),
  { ssr: false }
);

const CustomBlockOverlay = dynamic(
  () =>
    import('@/components/CustomBlockOverlay').then(
      (mod) => mod.CustomBlockOverlay
    ),
  { ssr: false }
);

export default function FillPage() {
  const params = useParams<{ id: string }>();
  const [pdf, setPdf] = useState<PDFDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSizes, setPageSizes] = useState<{ width: number; height: number }[]>([]);

  const {
    blocks,
    selectedId,
    addTextBlock,
    addImageBlock,
    updateBlock,
    removeBlock,
    selectBlock,
    getBlocksByPage,
  } = useCustomBlocks();

  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Load PDF page dimensions for custom block placement
    (async () => {
      try {
        const { PDFDocument: PDFLibDoc } = await import('pdf-lib');
        const arrayBuffer = await pdf.fileData.arrayBuffer();
        const doc = await PDFLibDoc.load(new Uint8Array(arrayBuffer), {
          ignoreEncryption: true,
        });
        const sizes = doc.getPages().map((p) => {
          const { width, height } = p.getSize();
          return { width, height };
        });
        setPageSizes(sizes);
      } catch {
        // Non-critical; blocks can use fallback size
      }
    })();
  }, [pdf]);

  const handleAddTextBlock = useCallback(() => {
    const size = pageSizes[currentPage] || { width: 612, height: 792 };
    addTextBlock(currentPage, size.width, size.height);
  }, [currentPage, pageSizes, addTextBlock]);

  const handleAddImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const imageType = file.type === 'image/png' ? 'png' : 'jpeg';
        const size = pageSizes[currentPage] || { width: 612, height: 792 };
        addImageBlock(currentPage, size.width, size.height, dataUrl, imageType);
      };
      reader.readAsDataURL(file);

      // Reset input so re-selecting the same file triggers onChange
      e.target.value = '';
    },
    [currentPage, pageSizes, addImageBlock]
  );

  const handleAddSignature = useCallback(
    (page: number, pageW: number, pageH: number, dataUrl: string) => {
      addImageBlock(page, pageW, pageH, dataUrl, 'png');
    },
    [addImageBlock]
  );

  const handleMeasureOffset = useCallback(
    (id: string, offsetX: number, offsetY: number) => {
      updateBlock(id, { textOffsetX: offsetX, textOffsetY: offsetY });
    },
    [updateBlock]
  );

  const handlePageChange = useCallback(
    (e: { currentPage: number }) => {
      setCurrentPage(e.currentPage);
      selectBlock(null);
    },
    [selectBlock]
  );

  const handleViewerClick = useCallback(() => {
    selectBlock(null);
  }, [selectBlock]);

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
        <span className="flex-1 text-sm font-medium">{pdf.name}</span>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddTextBlock}
          className="gap-1"
        >
          <Type className="size-4" />
          新增文字
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddImageClick}
          className="gap-1"
        >
          <Image className="size-4" />
          新增圖片
        </Button>

        <SignaturePadDialog
          currentPage={currentPage}
          pageWidth={pageSizes[currentPage]?.width ?? 612}
          pageHeight={pageSizes[currentPage]?.height ?? 792}
          onAddSignature={handleAddSignature}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={handleImageFileChange}
        />

        <ExportButton
          fileBlob={pdf.fileData}
          fileName={pdf.name}
          values={{}}
          customBlocks={blocks}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-[1080px] flex-1 overflow-hidden" onClick={handleViewerClick}>
          <PDFViewer
            file={pdf.fileData}
            onPageChange={handlePageChange}
            renderOverlay={({ pageIndex, scale, width, height }) => (
              <CustomBlockOverlay
                pageIndex={pageIndex}
                scale={scale}
                width={width}
                height={height}
                blocks={blocks}
                selectedId={selectedId}
                onUpdateBlock={updateBlock}
                onSelectBlock={selectBlock}
                onRemoveBlock={removeBlock}
                onMeasureOffset={handleMeasureOffset}
              />
            )}
          />
        </div>

        {/* Right: Field Panel (暫時隱藏) */}
        {/* <div className="overflow-y-auto border-t bg-background md:w-1/2 md:border-t-0 md:border-l">
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
        </div> */}
      </div>
    </div>
  );
}
