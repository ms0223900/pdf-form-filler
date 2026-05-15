# Next.js 16 App Router 模式

> 本專案使用 **Next.js 16.2.6** (App Router)，React 19。
> 若 Next.js 有破壞性更新，請查閱 `node_modules/next/dist/docs/` 中的相關說明。

---

## 1. 路由檔案慣例

| 檔案 | 用途 | 注意事項 |
|------|------|----------|
| `layout.tsx` | 共享佈局 | 可巢狀，不會重新 mount |
| `page.tsx` | 頁面內容 | 接收路由參數 |
| `loading.tsx` | 載入中狀態 | 自動包裹 Suspense，**不需手動加** |
| `error.tsx` | 錯誤邊界 | **必須** `'use client'` |
| `not-found.tsx` | 404 頁面 | 可由 `notFound()` 觸發 |
| `global-error.tsx` | 全局錯誤 | 需自備 `<html>` + `<body>` |

## 2. 路由參數 — params / searchParams 為 Promise

**Next.js 16 最大 breaking change**：`params` 與 `searchParams` 是 `Promise`，必須 `await`。

```typescript
// ✅ 正確
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // ...
}

// ✅ searchParams 也相同
export default async function Page(props: {
  searchParams: Promise<{ q: string }>
}) {
  const { q } = (await searchParams).q;
  // ...
}
```

## 3. Error Boundaries

```typescript
// error.tsx — 必須 'use client'
'use client';

export default function Error({
  error,
  unstable_retry, // 注意：非 reset()
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <button onClick={unstable_retry}>重試</button>;
}
```

## 4. Dynamic Import（PDF 元件必用）

所有使用 `pdf-lib`、`@react-pdf-viewer/core`、`react-signature-canvas` 的元件必須 dynamic import 並關閉 SSR：

```typescript
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  ssr: false,
});
```

## 5. 禁止事項

- ❌ 不使用 `route.ts`（本專案無 API）
- ❌ 不使用 Server Actions
- ❌ 不使用 Pages Router 模式（`getStaticProps`、`getServerSideProps` 等）
- ❌ 不引入 `next/router`（使用 `next/navigation`）
- ❌ 不在 Server Component 中使用 browser API

## 6. Metadata

頁面 meta 使用 exported `metadata` 物件：

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Form Filler',
};
```

`layout.tsx` 的 metadata 會自動合併至子頁面。
