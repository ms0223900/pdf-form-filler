# Feature: 素材管理滿版彈窗

## 目標

將素材管理從獨立頁面導航（`/materials`）改為全螢幕 Dialog 彈窗（從 `FillPage` 開啟），讓使用者在管理素材後，關閉彈窗即可回到填寫狀態，自訂區塊的排版不受影響。

## 使用情境

1. 使用者在 `FillPage` 編輯 PDF，已加入若干自訂文字/圖片區塊
2. 點擊「素材庫管理」→ 原本會導航到 `/materials`（頁面切換 → React state 遺失 → 區塊消失）
3. **改為**：在當前頁面開啟滿版 Dialog，內含完整素材管理功能（CRUD 四種素材）
4. 管理完素材後點擊關閉 → 回到 FillPage，所有自訂區塊保持原樣

## 實作摘要

### 抽取 MaterialsManager 元件

- 將 `src/app/materials/page.tsx` 的 UI 邏輯抽取到 `src/components/MaterialsManager.tsx`
- 接受選用 prop `onClose?: () => void`
- 若提供 `onClose`，Header 顯示「關閉」按鈕而非「返回」連結
- `src/app/materials/page.tsx` 改為輕量包裝，渲染 `<MaterialsManager />`

### 建立 MaterialsDialog 滿版彈窗

- 建立 `src/components/MaterialsDialog.tsx`
- 使用 shadcn `Dialog` 元件，內容區設為滿版（`inset-0`、`max-w-none`、`h-full`）
- 接受 `open` / `onOpenChange` props（controlled）

### 修改 FillPage

- FillPage 工具列以按鈕觸發 `setMaterialsDialogOpen(true)`
- 同時將 `materialsDialogOpen` 狀態傳遞給 `MaterialPanel.onNavigateToManage`
- 移除 `<Link href="/materials">`

## 受影響檔案

| 檔案 | 變更類型 |
|------|----------|
| `src/components/MaterialsManager.tsx` | 新增 |
| `src/components/MaterialsDialog.tsx` | 新增 |
| `src/app/materials/page.tsx` | 重構為輕量包裝 |
| `src/app/fill/[id]/page.tsx` | 修改（Link → Dialog trigger） |
| `src/components/MaterialPanel.tsx` | 修改（新增 onNavigateToManage prop） |

## 對應 User Story

- US-008a（型別擴充 + 頁面基礎架構）— MaterialsManager、MaterialsDialog
- US-006a（素材庫套用面板）— MaterialPanel onNavigateToManage 整合
