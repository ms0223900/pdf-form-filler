import {
  PDFDocument,
  PDFTextField,
  PDFCheckBox,
  PDFRadioGroup,
  PDFDropdown,
} from 'pdf-lib';
import type { PDFField } from './types';

export async function detectFormFields(blob: Blob): Promise<PDFField[]> {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const header = new TextDecoder().decode(bytes.slice(0, 5));
  if (header !== '%PDF-') {
    throw new Error('檔案格式不是 PDF');
  }

  const pdfDoc = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
  });

  let form;
  try {
    form = pdfDoc.getForm();
  } catch {
    return [];
  }

  const fields: PDFField[] = [];

  for (const field of form.getFields()) {
    const name = field.getName();
    if (!name) continue;

    if (field instanceof PDFTextField) {
      fields.push({ name, type: 'text', required: false });
    } else if (field instanceof PDFCheckBox) {
      fields.push({ name, type: 'checkbox', required: false });
    } else if (field instanceof PDFRadioGroup) {
      const radioField = form.getRadioGroup(name);
      const options = radioField.getOptions();
      fields.push({ name, type: 'radio', required: false, options });
    } else if (field instanceof PDFDropdown) {
      const dropdownField = form.getDropdown(name);
      const options = dropdownField.getOptions();
      fields.push({ name, type: 'dropdown', required: false, options });
    }
  }

  return fields;
}

export async function fillAndExport(
  originalBlob: Blob,
  values: Record<string, string | boolean>
): Promise<Blob> {
  const arrayBuffer = await originalBlob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const pdfDoc = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
  });

  const form = pdfDoc.getForm();

  for (const field of form.getFields()) {
    const name = field.getName();
    if (!(name in values)) continue;

    const value = values[name];

    try {
      if (field instanceof PDFTextField && typeof value === 'string') {
        form.getTextField(name).setText(value);
      } else if (field instanceof PDFCheckBox) {
        const cb = form.getCheckBox(name);
        value ? cb.check() : cb.uncheck();
      } else if (field instanceof PDFRadioGroup && typeof value === 'string') {
        form.getRadioGroup(name).select(value);
      } else if (field instanceof PDFDropdown && typeof value === 'string') {
        form.getDropdown(name).select(value);
      }
    } catch (e) {
      console.warn(`無法填入欄位 "${name}":`, e);
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
