'use client';

import type { PDFField } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FieldRendererProps {
  field: PDFField;
  value: string | boolean | undefined;
  onChange: (name: string, value: string | boolean) => void;
}

export function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  const { name, type, required, readOnly, options } = field;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <Label className="text-sm font-medium">
          {name}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
        {readOnly && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            唯讀
          </span>
        )}
      </div>

      {readOnly ? (
        <p className="text-sm text-muted-foreground">
          {type === 'checkbox'
            ? value
              ? '✓ 已勾選'
              : '✗ 未勾選'
            : (value as string) || '-'}
        </p>
      ) : (
        renderInput()
      )}
    </div>
  );

  function renderInput() {
    switch (type) {
      case 'text':
        return (
          <Input
            value={(value as string) ?? ''}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={`輸入${name}`}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={!!value}
              onCheckedChange={(checked) => onChange(name, !!checked)}
              id={`field-${name}`}
            />
            <Label htmlFor={`field-${name}`} className="text-sm">
              {value ? '已勾選' : '未勾選'}
            </Label>
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={(value as string) ?? ''}
            onValueChange={(v) => onChange(name, v)}
          >
            {options?.map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`${name}-${opt}`} />
                <Label htmlFor={`${name}-${opt}`}>{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'dropdown':
        return (
          <Select
            value={(value as string) ?? ''}
            onValueChange={(v) => v && onChange(name, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`選擇${name}`} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
    }
  }
}
