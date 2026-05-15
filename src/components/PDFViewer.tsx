'use client';

import { useEffect, useMemo, useState } from 'react';
import { Viewer, Worker, SpecialZoomLevel, type DocumentLoadEvent, type PageChangeEvent } from '@react-pdf-viewer/core';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface PDFViewerProps {
  file: Blob;
}

const WORKER_URL = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

export function PDFViewer({ file }: PDFViewerProps) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState<number | SpecialZoomLevel>(SpecialZoomLevel.PageWidth);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  function handleDocumentLoad(e: DocumentLoadEvent) {
    setNumPages(e.doc.numPages);
  }

  function handlePageChange(e: PageChangeEvent) {
    setCurrentPage(e.currentPage);
  }

  function goToPrevPage() {
    setCurrentPage((p) => Math.max(0, p - 1));
  }

  function goToNextPage() {
    setCurrentPage((p) => Math.min(numPages - 1, p + 1));
  }

  function zoomIn() {
    setScale((prev) => {
      if (typeof prev !== 'number') return 1.2;
      return Math.round(prev * 1.2 * 10) / 10;
    });
  }

  function zoomOut() {
    setScale((prev) => {
      if (typeof prev !== 'number') return 1;
      return Math.round((prev / 1.2) * 10) / 10;
    });
  }

  return (
    <Worker workerUrl={WORKER_URL}>
      <div className="flex h-full flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={goToPrevPage} disabled={currentPage <= 0}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="mx-1 text-sm tabular-nums">
              {numPages > 0 ? `${currentPage + 1} / ${numPages}` : '-'}
            </span>
            <Button variant="ghost" size="icon" onClick={goToNextPage} disabled={currentPage >= numPages - 1}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={zoomOut}>
              <ZoomOut className="size-4" />
            </Button>
            <span className="min-w-[3rem] text-center text-sm tabular-nums">
              {typeof scale === 'number' ? `${Math.round(scale * 100)}%` : '自動'}
            </span>
            <Button variant="ghost" size="icon" onClick={zoomIn}>
              <ZoomIn className="size-4" />
            </Button>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 overflow-auto bg-muted/30">
          <Viewer
            key={`${currentPage}-${typeof scale === 'number' ? scale : scale}`}
            fileUrl={url}
            initialPage={currentPage}
            defaultScale={scale}
            onDocumentLoad={handleDocumentLoad}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </Worker>
  );
}
