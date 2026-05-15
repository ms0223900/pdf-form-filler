'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { fillAndExport } from '@/lib/pdfUtils';
import { Download, Loader2 } from 'lucide-react';
import type { CustomBlock } from '@/lib/types';

interface ExportButtonProps {
  fileBlob: Blob;
  fileName: string;
  values: Record<string, string | boolean>;
  customBlocks?: CustomBlock[];
}

export function ExportButton({ fileBlob, fileName, values, customBlocks }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setError(null);

    try {
      const resultBlob = await fillAndExport(fileBlob, values, customBlocks);
      const url = URL.createObjectURL(resultBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}-filled.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : '匯出失敗，請稍後再試');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            匯出中...
          </>
        ) : (
          <>
            <Download className="size-4" />
            匯出 PDF
          </>
        )}
      </Button>
      {error && (
        <span className="text-xs text-destructive">{error}</span>
      )}
    </div>
  );
}
