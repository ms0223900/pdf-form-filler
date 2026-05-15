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
import fontkit from '@pdf-lib/fontkit';
import type { CustomBlock, CustomTextBlock, PDFField } from './types';

// ---------------------------------------------------------------------------
// CJK font support — loaded from local /fonts/ once, cached afterwards
// ---------------------------------------------------------------------------

let cjkFontBytes: Uint8Array | null = null;

async function fetchCJKFont(): Promise<Uint8Array | null> {
  if (cjkFontBytes) return cjkFontBytes;

  // Try each source in order until one succeeds
  const sources = [
    // 1) Local font bundled with the app
    '/fonts/NotoSansTC-Regular.ttf',
    // 2) Google Fonts direct gstatic URL
    'https://fonts.gstatic.com/s/notosanstc/v39/-nFuOG829Oofr2wohFbTp9ifNAn722rq0MXz76Cy_Co.ttf',
  ];

  for (const url of sources) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        cjkFontBytes = new Uint8Array(await res.arrayBuffer());
        return cjkFontBytes;
      }
    } catch {
      // try next source
    }
  }

  // 3) Fallback: Google Fonts CSS API — dynamically discover font URL
  try {
    const cssRes = await fetch(
      'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400'
    );
    if (cssRes.ok) {
      const css = await cssRes.text();
      const match = css.match(/url\(([^)]+)\)/);
      if (match) {
        const fontUrl = match[1];
        const fontRes = await fetch(fontUrl);
        if (fontRes.ok) {
          cjkFontBytes = new Uint8Array(await fontRes.arrayBuffer());
          return cjkFontBytes;
        }
      }
    }
  } catch {
    // fall through
  }

  console.warn(
    '[pdfUtils] 無法載入 CJK 字型，中文文字將使用 Helvetica（僅支援 Latin 字元）'
  );
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
        pdfDoc.registerFontkit(fontkit);
        cjkFont = await pdfDoc.embedFont(bytes);
      } catch (e) {
        console.warn('[pdfUtils] CJK 字型嵌入失敗，降級至 Helvetica:', e);
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
