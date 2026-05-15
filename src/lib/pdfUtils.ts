import {
  PDFDocument,
  PDFFont,
  PDFTextField,
  PDFCheckBox,
  PDFRadioGroup,
  PDFDropdown,
  StandardFonts,
  rgb,
} from 'pdf-lib';
import type { CustomBlock, CustomTextBlock, PDFField } from './types';

// ---------------------------------------------------------------------------
// CJK font support — fetch from CDN once, cache for subsequent calls
// ---------------------------------------------------------------------------

let cjkFontBytes: Uint8Array | null = null;

async function fetchCJKFont(): Promise<Uint8Array | null> {
  if (cjkFontBytes) return cjkFontBytes;

  const urls = [
    // jsdelivr (Noto Sans TC from GitHub release)
    'https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/OTF/TraditionalChinese/NotoSansTC-Regular.otf',
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        cjkFontBytes = new Uint8Array(await res.arrayBuffer());
        return cjkFontBytes;
      }
    } catch {
      // try next URL
    }
  }
  return null;
}

function needsCJK(text: string): boolean {
  return /[^\x00-\x7F]/.test(text);
}

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16) / 255,
    g: parseInt(clean.slice(2, 4), 16) / 255,
    b: parseInt(clean.slice(4, 6), 16) / 255,
  };
}

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
      fields.push({ name, type: 'text', required: field.isRequired(), readOnly: field.isReadOnly() });
    } else if (field instanceof PDFCheckBox) {
      fields.push({ name, type: 'checkbox', required: field.isRequired(), readOnly: field.isReadOnly() });
    } else if (field instanceof PDFRadioGroup) {
      const radioField = form.getRadioGroup(name);
      const options = radioField.getOptions();
      fields.push({ name, type: 'radio', required: field.isRequired(), readOnly: field.isReadOnly(), options });
    } else if (field instanceof PDFDropdown) {
      const dropdownField = form.getDropdown(name);
      const options = dropdownField.getOptions();
      fields.push({ name, type: 'dropdown', required: field.isRequired(), readOnly: field.isReadOnly(), options });
    }
  }

  return fields;
}

export async function embedCustomBlocks(
  pdfDoc: PDFDocument,
  blocks: CustomBlock[]
): Promise<void> {
  // Separate text blocks so we can decide whether a CJK font is needed
  const textBlocks = blocks.filter(
    (b): b is CustomTextBlock => b.type === 'text'
  );
  const needsCjkFont = textBlocks.some((b) => needsCJK(b.text));

  let cjkFont: PDFFont | null = null;
  if (needsCjkFont) {
    const bytes = await fetchCJKFont();
    if (bytes) {
      try {
        cjkFont = await pdfDoc.embedFont(bytes);
      } catch {
        // fall through to standard font below
      }
    }
  }

  const fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  for (const block of blocks) {
    const page = pages[block.page];
    if (!page) continue;

    if (block.type === 'text') {
      const font = (needsCJK(block.text) && cjkFont) ? cjkFont : fallbackFont;
      const textOffsetX = block.textOffsetX ?? 0;
      const textOffsetY = block.textOffsetY ?? 0;
      const { r, g, b } = hexToRgb(block.color);
      page.drawText(block.text, {
        x: block.x + textOffsetX,
        y: block.y + block.height - textOffsetY - block.fontSize * 0.8,
        size: block.fontSize,
        font,
        color: rgb(r, g, b),
        maxWidth: block.width,
      });
    } else if (block.type === 'image') {
      let image;

      try {
        const base64Data = block.imageData.replace(
          /^data:image\/\w+;base64,/,
          ''
        );
        if (block.imageType === 'png') {
          image = await pdfDoc.embedPng(base64Data);
        } else {
          image = await pdfDoc.embedJpg(base64Data);
        }
      } catch (e) {
        console.warn(`無法嵌入圖片 "${block.id}":`, e);
        continue;
      }

      if (image) {
        page.drawImage(image, {
          x: block.x,
          y: block.y,
          width: block.width,
          height: block.height,
        });
      }
    }
  }
}

export async function fillAndExport(
  originalBlob: Blob,
  values: Record<string, string | boolean>,
  customBlocks?: CustomBlock[]
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

  if (customBlocks && customBlocks.length > 0) {
    await embedCustomBlocks(pdfDoc, customBlocks);
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
