# PDF Form Filler — Project Guidelines

<!-- BEGIN:nextjs-agent-rules -->
> **This is NOT the Next.js you know.** This project uses Next.js 16 with breaking changes — APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 專案概述
瀏覽器端 PDF 填表工具。Next.js 16 App Router + TypeScript。無後端，全離線運作。

## 技術選型
- **框架**: Next.js 16 (App Router)
- **語言**: TypeScript strict mode, React 19
- **樣式**: Tailwind CSS v4
- **UI 元件**: shadcn/ui (base-nova 風格, @base-ui/react 原語)
- **PDF**: pdf-lib (讀取/修改/匯出), @react-pdf-viewer/core (渲染)
- **儲存**: Dexie.js (IndexedDB)
- **簽名**: react-signature-canvas
- **套件管理**: npm

## 架構原則
1. **全 Client Components** — PDF 操作與 IndexedDB 為 browser-only，所有使用到這些 API 的元件需標 `'use client'`，dynamic import 需設 `{ ssr: false }`
2. **無後端** — 不可引入任何 API route、server action 或資料庫（Dexie 除外）
3. **型別優先** — 共用型別集中於 `lib/types.ts`
4. **不重複造輪子** — 優先使用上述已選定的套件，不自行實作 PDF 操作

## 目錄結構
```
src/
├── app/              # Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx
│   ├── fill/[id]/
│   └── materials/
├── components/       # React components
│   └── ui/           # shadcn/ui 元件（不可手動修改原始樣式）
├── hooks/            # Custom React hooks
└── lib/              # Utility modules & DB
docs/
  spec.md             # 技術規格書
  rules/              # 開發規則（見下方索引）
```

## 程式碼風格
- 型別定義不重複，從 `lib/types.ts` 匯入共用
- 組件 props 使用 `interface` 定義並 export
- 使用 named export 匯出組件
- IndexedDB 操作統一透過 `lib/db.ts` 與 `lib/materialStore.ts`
- PDF 操作統一透過 `lib/pdfUtils.ts`

## shadcn/ui 規範
- 已安裝的元件方可使用，避免自行覆蓋原始樣式
- 使用 `npx shadcn@latest add [component]` 新增元件

## 簽名處理
- 原始 canvas 簽名僅存在於簽名元件
- 儲存時轉為 base64 PNG data URL
- 匯出時透過 pdf-lib embedPNG 嵌入 PDF

## 規則檔案索引
詳細開發規則請參閱以下檔案：
- [Next.js 16 模式](docs/rules/nextjs.md) — App Router 慣例、breaking changes、dynamic imports
- [程式碼風格](docs/rules/code-style.md) — TypeScript 慣例、命名、檔案組織、錯誤處理
- [PDF 操作](docs/rules/pdf.md) — pdf-lib、react-pdf-viewer、AcroForm、座標系統
- [Tailwind v4](docs/rules/tailwind.md) — v4 語法、theme、dark mode、shadcn/base-nova
