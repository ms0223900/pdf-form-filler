'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Viewer,
  Worker,
  SpecialZoomLevel,
  type DocumentLoadEvent,
  type PageChangeEvent,
  type RenderPageProps,
} from '@react-pdf-viewer/core';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

export interface PageOverlayProps {
  pageIndex: number;
  scale: number;
  width: number;
  height: number;
}

interface PDFViewerProps {
  file: Blob;
  renderOverlay?: (props: PageOverlayProps) => React.ReactNode;
  onScaleChange?: (scale: number) => void;
  onPageChange?: (e: PageChangeEvent) => void;
}

const WORKER_URL =
  'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

export function PDFViewer({ file, renderOverlay, onScaleChange, onPageChange: onParentPageChange }: PDFViewerProps) {
  const [fileData, setFileData] = useState<Uint8Array | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState<number | SpecialZoomLevel>(
    SpecialZoomLevel.PageWidth
  );

  const overlayRef = useRef(renderOverlay);
  overlayRef.current = renderOverlay;

  // Read Blob into stable Uint8Array (avoids Blob URL revocation race conditions)
  useEffect(() => {
    let active = true;
    setFileData(null);
    file.arrayBuffer().then((buf) => {
      if (active) setFileData(new Uint8Array(buf));
    });
    return () => {
      active = false;
    };
  }, [file]);

  function handleDocumentLoad(e: DocumentLoadEvent) {
    setNumPages(e.doc.numPages);
  }

  function handlePageChange(e: PageChangeEvent) {
    setCurrentPage(e.currentPage);
    onParentPageChange?.(e);
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
      const next = Math.round(prev * 1.2 * 10) / 10;
      onScaleChange?.(next);
      return next;
    });
  }

  function zoomOut() {
    setScale((prev) => {
      if (typeof prev !== 'number') return 1;
      const next = Math.round((prev / 1.2) * 10) / 10;
      onScaleChange?.(next);
      return next;
    });
  }

  const renderPage = useCallback((props: RenderPageProps) => {
    const overlay = overlayRef.current?.({
      pageIndex: props.pageIndex,
      scale: props.scale,
      width: props.width,
      height: props.height,
    });

    return (
      <div
        style={{
          position: 'relative',
          width: props.width,
          height: props.height,
        }}
      >
        <div {...props.canvasLayer.attrs}>{props.canvasLayer.children}</div>
        <div {...props.textLayer.attrs}>{props.textLayer.children}</div>
        <div {...props.annotationLayer.attrs}>
          {props.annotationLayer.children}
        </div>
        {overlay && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {overlay}
          </div>
        )}
      </div>
    );
  }, []);

  const currentScale =
    typeof scale === 'number' ? scale : null;

  return (
    <Worker workerUrl={WORKER_URL}>
      <div className="flex h-full flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevPage}
              disabled={currentPage <= 0}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="mx-1 text-sm tabular-nums">
              {numPages > 0 ? `${currentPage + 1} / ${numPages}` : '-'}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextPage}
              disabled={currentPage >= numPages - 1}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={zoomOut}>
              <ZoomOut className="size-4" />
            </Button>
            <span className="min-w-[3rem] text-center text-sm tabular-nums">
              {currentScale ? `${Math.round(currentScale * 100)}%` : '自動'}
            </span>
            <Button variant="ghost" size="icon" onClick={zoomIn}>
              <ZoomIn className="size-4" />
            </Button>
          </div>
        </div>

        {/* Viewer or loading state */}
        <div className="flex-1 overflow-auto bg-muted/30">
          {fileData ? (
            <Viewer
              fileUrl={fileData}
              initialPage={currentPage}
              defaultScale={scale}
              onDocumentLoad={handleDocumentLoad}
              onPageChange={handlePageChange}
              renderPage={renderPage}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              載入中...
            </div>
          )}
        </div>
      </div>
    </Worker>
  );
}
