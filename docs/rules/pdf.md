# PDF 操作規則

## 技術棧
- **pdf-lib** — 讀取 AcroForm、寫入欄位值、匯出 PDF
- **@react-pdf-viewer/core** — PDF 頁面渲染（基於 PDF.js）

所有使用上述套件的元件必須 `'use client'` + dynamic import `{ ssr: false }`。

---

## 1. Blob 轉換 Pipeline

PDF 操作中頻繁轉換 Blob / ArrayBuffer / Uint8Array：

```typescript
// 讀取：Blob → Uint8Array
const arrayBuffer = await blob.arrayBuffer();
const uint8Array = new Uint8Array(arrayBuffer);
const pdfDoc = await PDFDocument.load(uint8Array);

// 寫出：pdf-lib → Blob → 下載
const pdfBytes = await pdfDoc.save();
const blob = new Blob([pdfBytes], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);
// ... 下載後務必 revoke
URL.revokeObjectURL(url);
```

## 2. AcroForm 欄位處理

### 偵測欄位（from pdf-lib）

```typescript
import { PDFDocument } from 'pdf-lib';

export interface PDFField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown';
  required: boolean;
  options?: string[];
}

export async function detectFormFields(blob: Blob): Promise<PDFField[]> {
  const arrayBuffer = await blob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(new Uint8Array(arrayBuffer));
  const form = pdfDoc.getForm();
  const fields: PDFField[] = [];

  for (const field of form.getFields()) {
    const type = field.constructor.name;
    // 依型別分派
    switch (type) {
      case 'PDFTextField':
        fields.push({ name: field.getName(), type: 'text', required: false });
        break;
      case 'PDFCheckBox':
        fields.push({ name: field.getName(), type: 'checkbox', required: false });
        break;
      // ...
    }
  }
  return fields;
}
```

### 寫入欄位值

```typescript
const form = pdfDoc.getForm();

// 文字欄位
const textField = form.getTextField('field_name');
textField.setText('使用者輸入值');

// 核取方塊
const checkBox = form.getCheckBox('field_name');
checkBox.check();   // 勾選
checkBox.uncheck(); // 取消

// 下拉選單
const dropdown = form.getDropdown('field_name');
dropdown.select('選項值');
```

## 3. 座標系統

- **PDF 原點 (0,0) 在左下角**，單位為 point（1pt = 1/72 inch）
- **react-pdf canvas 原點在左上角**（CSS 標準）
- 若需要在 PDF 預覽上疊加 UI，需反向 Y 軸座標

```typescript
// PDF 座標 → 螢幕座標（canvas 高度已知時）
const screenY = canvasHeight - pdfY;
```

## 4. Worker 設定（@react-pdf-viewer）

```typescript
// 需 dynamic import + ssr: false
import { Viewer } from '@react-pdf-viewer/core';

// worker 設定（在 dynamic import 的元件內）
import { Worker } from '@react-pdf-viewer/core';

function PDFViewer({ blob }: { blob: Blob }) {
  const url = URL.createObjectURL(blob);

  useEffect(() => {
    return () => URL.revokeObjectURL(url); // cleanup
  }, [url]);

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <Viewer fileUrl={url} />
    </Worker>
  );
}
```

## 5. 錯誤處理

```typescript
export async function loadPdfSafe(blob: Blob): Promise<PDFDocument | null> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // 基本驗證：檢查 PDF header
    const header = new TextDecoder().decode(bytes.slice(0, 5));
    if (header !== '%PDF-') {
      throw new Error('檔案格式不是 PDF');
    }

    return await PDFDocument.load(bytes);
  } catch (error) {
    // 回傳 null 讓 UI 層顯示錯誤訊息
    console.error('PDF 載入失敗:', error);
    return null;
  }
}
```

## 6. 記憶體管理

- 使用完 `URL.createObjectURL` 後務必呼叫 `URL.revokeObjectURL()`
- 避免同時在記憶體中保留多個大型 `PDFDocument` 實例
- 不需要的 `pdfDoc` 讓 GC 回收（設為 `null` 或離開作用域）
- 大型 PDF（>20MB）建議在使用後主動釋放參考

## 7. 匯出流程

```typescript
export async function fillAndExport(
  originalBlob: Blob,
  values: Record<string, string | boolean>
): Promise<Blob> {
  const arrayBuffer = await originalBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(new Uint8Array(arrayBuffer));
  const form = pdfDoc.getForm();

  for (const [name, value] of Object.entries(values)) {
    const field = form.getFieldMaybe(name);
    if (!field) continue;

    if (typeof value === 'string') {
      const textField = form.getTextField(name);
      textField.setText(value);
    } else {
      const checkBox = form.getCheckBox(name);
      value ? checkBox.check() : checkBox.uncheck();
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
```
