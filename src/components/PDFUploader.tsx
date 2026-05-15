'use client';

import { useRef, useState, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { Upload } from 'lucide-react';

interface PDFUploaderProps {
  onUpload: () => void;
}

export function PDFUploader({ onUpload }: PDFUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validateFile(file: File) {
    if (file.type && file.type !== 'application/pdf') {
      setError('僅支援 PDF 檔案');
      return false;
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('僅支援 PDF 檔案');
      return false;
    }
    return true;
  }

  async function handleFile(file: File) {
    setError(null);
    if (!validateFile(file)) return;

    await db.pdfs.add({
      name: file.name.replace(/\.pdf$/i, ''),
      fileData: file,
      uploadedAt: new Date(),
      type: 'upload',
    });

    onUpload();
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
        dragOver
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      <Upload className="mb-2 size-8 text-muted-foreground" />
      <p className="mb-1 text-sm font-medium">拖曳 PDF 到此處</p>
      <p className="mb-4 text-xs text-muted-foreground">或</p>
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
      >
        選擇 PDF 檔案
      </Button>

      {error && (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
