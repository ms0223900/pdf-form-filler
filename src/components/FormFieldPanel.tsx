'use client';

import type { PDFField } from '@/lib/types';
import { FieldRenderer } from './FieldRenderer';
import { FileText } from 'lucide-react';

interface FormFieldPanelProps {
  fields: PDFField[];
  values: Record<string, string | boolean>;
  onChange: (name: string, value: string | boolean) => void;
}

export function FormFieldPanel({ fields, values, onChange }: FormFieldPanelProps) {
  if (fields.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <FileText className="size-8" />
        <p>此 PDF 不含可填寫的表單欄位</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-medium">
          表單欄位
          <span className="ml-1 text-xs text-muted-foreground">
            ({fields.length})
          </span>
        </h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {fields.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            value={values[field.name]}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}
