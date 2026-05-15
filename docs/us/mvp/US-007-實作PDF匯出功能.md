### US-007：實作 PDF 匯出功能

**作為** 使用者
**我想要** 點擊「匯出」按鈕將填寫內容寫入 PDF 並下載
**以便** 取得已填寫完成的 PDF 檔案

**輸入格式**：
- 原始 PDF Blob（從 IndexedDB 讀取）
- 所有欄位的填寫值（`Record<string, string | boolean>`）
- 簽名圖片視為一般欄位值，透過 values 物件傳入

**輸出格式**：
- `src/components/ExportButton.tsx` — 匯出按鈕，觸發下載

**驗收條件**：
- [ ] 點擊「匯出」按鈕後，瀏覽器下載一個 PDF 檔案
- [ ] 下載的 PDF 包含使用者填寫的所有欄位值
- [ ] 簽名圖片（透過 base64 欄位值）正確嵌入 PDF 中
- [ ] 下載的 PDF 可在 Adobe Acrobat / 瀏覽器 PDF 檢視器中正常開啟
- [ ] 匯出過程中顯示載入狀態（防止重複點擊）
- [ ] 匯出失敗時顯示錯誤訊息
- [ ] `npx tsc --noEmit` 無錯誤

**依賴關係**：
- US-002（需 pdfUtils 的 `fillAndExport`）
- US-005a（需填寫頁面的欄位 state）
- US-005b（需填寫頁面的欄位 state）

**優先級**：P1
**相關功能**：匯出（spec §3.2 匯出按鈕, §7.4）
