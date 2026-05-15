# 程式碼風格

## TypeScript 慣例

- **`interface`** — 用於定義物件型別（props, state, 資料結構）
- **`type`** — 用於聯合型別、交叉型別、基本型別別名
- **`unknown`** — 優先於 `any`；真的需要放行時用 `as` 斷言
- **`as const`** — 用於常數、選項列表、列舉型字串
- **泛型參數命名** — 單字母夠用時用 `T`；複雜場景用完整單字 `TValue`

```typescript
// ✅ 正確
export interface PDFViewerProps {
  file: Blob;
  pageNumber: number;
  onPageChange: (page: number) => void;
}

export type FieldType = 'text' | 'checkbox' | 'radio' | 'dropdown';

// ❌ 避免
export type PDFViewerProps = { ... }; // props 用 interface
const data: any = await load();       // 用 unknown + 斷言
```

## 命名規則

| 類別 | 慣例 | 範例 |
|------|------|------|
| React 元件 | PascalCase (named export) | `export function PDFViewer(...)` |
| Custom hooks | camelCase, `use` 前綴 | `usePdfDocument`, `useFormFields` |
| 工具函式 | camelCase | `detectFormFields`, `fillAndExport` |
| 型別/介面 | PascalCase | `PDFField`, `PersonalInfo` |
| 檔案名稱 | 與 export 名稱一致 | `PDFViewer.tsx`, `pdfUtils.ts` |

## 檔案組織

```
src/
├── app/              # 頁面元件（盡量薄）
├── components/       # 共用元件 + ui/
│   └── ui/           # shadcn/ui 產生的元件（不可手動修改）
├── hooks/            # Custom hooks（usePdfDocument, useFormFields, ...）
└── lib/              # 工具模組 & 資料庫
```

- 一個檔案只 export 一個主要元件/hook
- 不做 barrel files（`index.ts` 重新匯出）
- 小型輔助函式可直接留在使用處，不需要時就別抽取

## Import 順序

同一檔案內依以下順序分組（組間空一行）：

```typescript
// 1. React / Next.js
import { useState } from 'react';
import { useParams } from 'next/navigation';

// 2. 第三方套件
import { PDFDocument } from 'pdf-lib';

// 3. 專案內部（依 @/ 路徑深度）
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 4. 相對路徑
import { type PDFField } from '../types';

// 5. CSS（只在必要時）
import './styles.css';
```

## 錯誤處理

每個 domain 操作獨立 try/catch，提供使用者可讀的錯誤訊息：

```typescript
export async function loadPdfDocument(blob: Blob): Promise<PDFDocument> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    return await PDFDocument.load(arrayBuffer);
  } catch (error) {
    throw new Error('PDF 檔案無效或已損壞，請檢查檔案');
  }
}
```

## 狀態管理

- **V1 不需全域狀態管理庫**
- 頁面層級狀態使用 `useState` lift 到 fill page
- IndexedDB 讀取透過 `useEffect` + `useState`，或封裝為 custom hook
- 跨元件傳遞使用 props（非 Context，除非真的需要）

```typescript
// ✅ 使用 custom hook 封裝 IndexedDB 操作
export function usePdfDocument(id: string) {
  const [doc, setDoc] = useState<PDFDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.pdfs.get(Number(id)).then((result) => {
      setDoc(result ?? null);
      setLoading(false);
    });
  }, [id]);

  return { doc, loading };
}
```
