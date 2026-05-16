### US-005a：實作 PDF 預覽元件與填寫頁框架

**作為** 使用者
**我想要** 在 `/fill/[id]` 頁面看到 PDF 預覽，支援分頁導覽與縮放
**以便** 檢視並編修 PDF 內容

**輸入格式**：
- `id` URL 參數，用於從 IndexedDB 讀取 PDF Blob

**輸出格式**：
- `src/app/fill/[id]/page.tsx` — 填寫頁面框架（載入 PDF、管理 state、單欄置中佈局）
- `src/components/PDFViewer.tsx` — PDF 預覽（使用 `@react-pdf-viewer/core`，dynamic import + `{ ssr: false }`）

**驗收條件**：
- [x] 頁面從 URL 參數 `id` 讀取 PDF，從 IndexedDB 載入
- [x] 載入過程中顯示載入中狀態
- [x] 載入失敗時顯示錯誤訊息（如 PDF 不存在）
- [x] PDF 預覽置中於畫面，最大寬度 1080px
- [x] 支援分頁導覽（上一頁 / 下一頁）
- [x] 支援縮放控制（放大 / 縮小）
- [x] 右側 AcroForm 欄位面板已隱藏（因多數 PDF 無可填寫欄位，版面優先留給自訂區塊）
- [x] `npx tsc --noEmit` 無錯誤

**依賴關係**：
- US-001（需 DB 讀取 PDF）

**優先級**：P0
**相關功能**：PDF 填寫（spec §3.2, §5）
