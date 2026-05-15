# Tailwind CSS v4 規則

> 本專案使用 **Tailwind CSS v4**（含 `@tailwindcss/postcss`），語法與 v3 有顯著差異。

---

## 1. 核心差異（v4 vs v3）

| v3 語法 | v4 語法 |
|---------|---------|
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| `tailwind.config.js` | **不需設定檔**，CSS-in-JS via `@theme` |
| `@apply` 有限支援 | `@apply` 完全支援 |
| `dark:` variant | `@custom-variant dark` |

## 2. 設定方式

所有主題設定在 CSS 中透過 `@theme inline` 定義（已於 `globals.css` 設定完畢）：

```css
/* globals.css — 不需修改 */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  /* ... */
}
```

## 3. 使用 CSS 變數

使用 `oklch()` 色彩空間的 CSS 變數（已設定於 `globals.css` 的 `:root` 和 `.dark`）：

```
--background: oklch(1 0 0);     /* 淺色模式背景 */
--foreground: oklch(0.145 0 0); /* 淺色模式文字 */
```

在 JSX 中使用 Tailwind utility classes：

```tsx
<div className="bg-background text-foreground p-4 rounded-lg">
  <h1 className="text-primary font-bold">標題</h1>
</div>
```

## 4. Dark Mode

透過在 `<html>` 元素切換 `.dark` class 控制。shadcn/ui 已內建支援，不需額外處理：

```tsx
// 切換方式（通常在佈局元件中）
document.documentElement.classList.toggle('dark');
```

## 5. shadcn/base-nova 注意事項

- 使用 `@base-ui/react` 原語（非 Radix UI）
- 樣式透過 `data-*` 屬性選擇器控制（非 `peer-*` / `group-*`）
- 所有 shadcn 元件在 `src/components/ui/` 中，**不可手動修改原始樣式**
- 顏色類別一律使用 CSS 變數（如 `bg-primary`、`text-muted-foreground`），不用色票編號

## 6. 禁止事項

- ❌ 不使用 `tailwind.config.js`
- ❌ 不使用 `@tailwind base/components/utilities`
- ❌ 不在 JSX 中使用 v3 專屬語法（如 `ring-offset-*` 舊寫法）
- ❌ 不手動修改 `globals.css` 中的 shadcn 變數區塊
- ❌ 不使用 Tailwind v3 的 `dark:` variant（已由 `.dark` class 控制）
