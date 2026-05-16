import fontkit from '@pdf-lib/fontkit';
import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFFont,
  PDFRadioGroup,
  PDFTextField,
  StandardFonts,
  rgb,
} from 'pdf-lib';
import type { CustomBlock, CustomTextBlock, PDFField } from './types';

// ---------------------------------------------------------------------------
// CJK font — Noto Sans TC「區域性子集」靜態 OTF（noto-cjk SubsetOTF/TC），覆蓋繁中高頻用字。
// 若需子集外罕字，後備為 Google Fonts 完整 TTF。詳見 public/fonts/NotoSansTC-LICENSE。
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

  // Last resort: discover full Noto Sans TC TTF via Google Fonts CSS (not the subset OTF)
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

  console.warn('[pdfUtils] 無法載入 CJK 字型檔（Noto Sans TC）');
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

/**
 * CJK（Noto Sans TC）務必嵌入完整字型，勿使用 `{ subset: true }`。
 * pdf-lib + @pdf-lib/fontkit 子集編碼在某些情境（中英混排、maxWidth 換行等）
 * 會與字型內容不一致，瀏覽器／閱讀器會出現大片缺字母或缺字形。
 */
async function embedCjkFont(
  pdfDoc: PDFDocument,
  bytes: Uint8Array
): Promise<PDFFont> {
  pdfDoc.registerFontkit(fontkit);
  return pdfDoc.embedFont(bytes);
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
    if (!bytes) {
      throw new Error(
        '[pdfUtils] 無法載入中文字型（Noto Sans TC），無法匯出含非 ASCII 文字的自訂區塊。請確認 public/fonts/NotoSansTC-Regular.otf 已佈署，或裝置可連線下載官方子集／完整字型。'
      );
    }
    try {
      cjkFont = await embedCjkFont(pdfDoc, bytes);
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      throw new Error(`[pdfUtils] 中文字型嵌入失敗，無法匯出自訂文字：${detail}`);
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
        // Match object-contain behavior: fit within block while preserving aspect ratio
        const imgAspect = image.width / image.height;
        const blockAspect = block.width / block.height;

        let drawWidth: number;
        let drawHeight: number;
        let drawX: number;
        let drawY: number;

        if (imgAspect > blockAspect) {
          // Image is wider → fit by width, center vertically
          drawWidth = block.width;
          drawHeight = drawWidth / imgAspect;
          drawX = block.x;
          drawY = block.y + (block.height - drawHeight) / 2;
        } else {
          // Image is taller → fit by height, center horizontally
          drawHeight = block.height;
          drawWidth = drawHeight * imgAspect;
          drawX = block.x + (block.width - drawWidth) / 2;
          drawY = block.y;
        }

        page.drawImage(image, {
          x: drawX,
          y: drawY,
          width: drawWidth,
          height: drawHeight,
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
        if (value) cb.check();
        else cb.uncheck();
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
