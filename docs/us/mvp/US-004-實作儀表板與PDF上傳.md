### US-004：實作儀表板與 PDF 上傳

**作為** 使用者
**我想要** 在首頁看到已上傳的 PDF 列表，並能上傳新的 PDF 或選擇預設範本
**以便** 開始填表流程

**輸入格式**：
- 使用者上傳的 PDF 檔案（瀏覽器 File 物件）
- ~~`public/templates/` 目錄中的預設範本（已移除此功能，PresetTemplates 為 placeholder 佔位元件）~~

**輸出格式**：
- `src/app/page.tsx` — 儀表板頁面
- `src/components/PDFUploader.tsx` — 上傳區域（含拖曳支援）
- `src/components/PresetTemplates.tsx` — 預設範本選擇區域
- `src/components/DashboardCard.tsx` — PDF 卡片元件

**驗收條件**：
- [x] 頁面顯示已上傳的 PDF 列表（卡片樣式，顯示檔名與上傳日期）
- [x] 無任何 PDF 時顯示提示引導使用者上傳或選擇範本
- [x] 點擊「上傳 PDF」按鈕可開啟檔案選擇器
- [x] 支援拖曳 PDF 到上傳區域
- [x] 上傳非 PDF 檔案時顯示錯誤訊息
- [x] 上傳後 PDF 出現在列表中，資料存入 IndexedDB
- [x] （已移除此功能）預設範本區域顯示內建範本 — AC 已撤銷，PresetTemplates 保留為 placeholder
- [x] 點擊任一 PDF 導航至 `/fill/[id]`
- [x] 頁面初始載入時從 IndexedDB 讀取既有 PDF 列表
- [x] 在手機版面垂直排列，卡片滿寬顯示
- [x] `npx tsc --noEmit` 無錯誤

**依賴關係**：
- US-001（需 DB 存取）

**優先級**：P0
**相關功能**：儀表板（spec §3.1）
