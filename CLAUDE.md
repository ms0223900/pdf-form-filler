# PDF Form Filler — Project Guidelines

## 專案概述
瀏覽器端 PDF 填表工具。Next.js 14 App Router + TypeScript。無後端，全離線運作。

## 開發規則

### 技術選型
- **框架**: Next.js 14 (App Router)
- **語言**: TypeScript strict mode
- **樣式**: tailwindcss
- **UI 元件**: shadcn/ui (Button, Input, Select, Dialog, Card, Checkbox, RadioGroup, Sheet)
- **PDF**: pdf-lib (讀取/修改/匯出), @react-pdf-viewer/core (渲染)
- **儲存**: Dexie.js (IndexedDB)
- **簽名**: react-signature-canvas
- **套件管理**: npm

### 架構原則
1. **全 Client Components** — PDF 操作與 IndexedDB 為 browser-only，所有使用到這些 API 的元件需標 `'use client'`，dynamic import 需設 `{ ssr: false }`
2. **無後端** — 不可引入任何 API route、server action 或資料庫（Dexie 除外）
3. **型別優先** — 共用型別集中於 `lib/types.ts`
4. **不重複造輪子** — 優先使用上述已選定的套件，不自行實作 PDF 操作

### 目錄結構
```
src/
├── app/              # Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx
│   ├── fill/[id]/
│   └── materials/
├── components/       # React components
└── lib/              # Utility modules & DB
docs/
  spec.md             # 技術規格書
```

### 程式碼風格
- 型別定義不重複，從 `lib/types.ts` 匯入共用
- 組件 props 使用 `interface` 定義並 export
- 使用 named export 匯出組件
- IndexedDB 操作統一透過 `lib/db.ts` 與 `lib/materialStore.ts`
- PDF 操作統一透過 `lib/pdfUtils.ts`

### shadcn/ui 規範
- 已安裝的元件方可使用，避免自行撰蓋原始樣式
- 使用 `npx shadcn@latest add [component]` 新增元件

### 簽名處理
- 原始 canvas 簽名僅存在於簽名元件
- 儲存時轉為 base64 PNG data URL
- 匯出時透過 pdf-lib embedPNG 嵌入 PDF
