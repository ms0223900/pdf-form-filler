### US-002：封裝 PDF 操作工具函式

**作為** 開發者
**我想要** 封裝 pdf-lib 的 AcroForm 欄位讀取與寫入操作
**以便** 元件層可以直接呼叫 `detectFormFields(blob)` 與 `fillAndExport(blob, values)` 而不需直接操作 pdf-lib

**輸入格式**：
- `Blob`（使用者上傳的 PDF 檔案）
- `lib/types.ts` 中的 `PDFField` 型別

**輸出格式**：
- `src/lib/pdfUtils.ts`，匯出兩個 async function：
  - `detectFormFields(blob: Blob): Promise<PDFField[]>` — 解析 PDF AcroForm 欄位
  - `fillAndExport(blob: Blob, values: Record<string, string | boolean>): Promise<Blob>` — 將值寫入 PDF 並回傳新 Blob

**驗收條件**：
- [ ] `detectFormFields` 能正確讀取含 AcroForm 的 PDF，回傳欄位名稱與型別
- [ ] `detectFormFields` 對不包含 AcroForm 的 PDF 回傳空陣列
- [ ] `detectFormFields` 對無效檔案拋出或回傳 null，不崩潰
- [ ] `fillAndExport` 能正確寫入文字欄位、核取方塊、下拉選單
- [ ] `fillAndExport` 匯出的 Blob 能被瀏覽器下載並在 PDF 檢視器中顯示已填寫的內容
- [ ] `npx tsc --noEmit` 無錯誤

**依賴關係**：
- US-001（需 `PDFField` 型別）

**優先級**：P0
**相關功能**：PDF 操作（spec §3.2, §6）
