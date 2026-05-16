### US-014：圖片浮水印 PDF 匯出

**作為** 使用者
**我想要** 匯出 PDF 時，已啟用浮水印的圖片在 PDF 中也包含浮水印文字
**以便** 下載的 PDF 文件有完整的用途標示

**輸入格式**：
- 更新後的 `CustomImageBlock` 型別（含 `watermark` 欄位）
- 現有 `embedCustomBlocks` 函式（`lib/pdfUtils.ts`）
- CJK 字型載入機制（`pdfUtils.ts` 已有 `fetchCJKFont`）

**輸出格式**：
- 更新 `src/lib/pdfUtils.ts` 中的 `embedCustomBlocks` — 處理圖片區塊時，若 `watermark.enabled === true`，在圖片上方繪製浮水印文字

**驗收條件**：
- [x] 圖片區塊 `watermark.enabled === true` 時，匯出的 PDF 中該圖片上方有浮水印文字
- [x] 浮水印文字使用與文字區塊相同的中文字型（Noto Sans TC）
- [x] 浮水印文字位置為圖片底部、水平置中，尺寸等比縮放
- [x] 浮水印文字為半透明紅色（如 `rgba(255,0,0,0.5)`）
- [x] `watermark.enabled === false` 或未設定時，匯出行為與既有邏輯完全相同
- [x] 圖片嵌入失敗時（`embedPng`/`embedJpg` 拋錯），不影響浮水印功能判斷，不額外拋錯
- [x] `npx tsc --noEmit` 無錯誤

**依賴關係**：
- US-013（需 `CustomImageBlock` 已含 `watermark` 欄位）
- US-010（需 `embedCustomBlocks` 與匯出流程已建立）

**優先級**：P1
**相關功能**：PDF 匯出（spec §3.2, §5）
