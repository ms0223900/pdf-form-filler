### US-005a：實作 PDF 預覽元件與填寫頁框架

**作為** 使用者
**我想要** 在 `/fill/[id]` 頁面左側看到 PDF 預覽，支援分頁導覽與縮放
**以便** 檢視表單內容

**輸入格式**：
- `id` URL 參數，用於從 IndexedDB 讀取 PDF Blob

**輸出格式**：
- `src/app/fill/[id]/page.tsx` — 填寫頁面框架（載入 PDF、管理 state、雙欄佈局框架）
- `src/components/PDFViewer.tsx` — PDF 預覽（使用 `@react-pdf-viewer/core`，dynamic import + `{ ssr: false }`）

**驗收條件**：
- [ ] 頁面從 URL 參數 `id` 讀取 PDF，從 IndexedDB 載入
- [ ] 載入過程中顯示載入中狀態
- [ ] 載入失敗時顯示錯誤訊息（如 PDF 不存在）
- [ ] 左側顯示 PDF 第一頁
- [ ] 支援分頁導覽（上一頁 / 下一頁 / 跳頁輸入）
- [ ] 支援縮放控制（放大 / 縮小 / 適合寬度）
- [ ] 頁面已預留右側欄位面板的整合位置
- [ ] 在手機上改為垂直單欄佈局（PDF 預覽在上方）
- [ ] `npx tsc --noEmit` 無錯誤

**依賴關係**：
- US-001（需 DB 讀取 PDF）

**優先級**：P0
**相關功能**：PDF 填寫（spec §3.2, §5）
