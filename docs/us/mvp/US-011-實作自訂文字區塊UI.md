### US-011：實作自訂文字區塊 UI

**作為** 使用者
**我想要** 在 PDF 預覽上點擊任意位置新增文字輸入框，輸入文字並可拖曳移動、調整大小、刪除
**以便** 在沒有 AcroForm 欄位的 PDF 上也能手動填入文字

**輸入格式**：
- PDF 預覽畫面（`PDFViewer` 元件）
- 使用者點擊位置（相對於 PDF 頁面的 x/y 座標）
- 使用者在文字框內輸入的文字內容

**輸出格式**：
- `src/components/CustomBlockOverlay.tsx` — 自訂區塊 overlay 容器，管理多個區塊的渲染
- `src/components/TextBlock.tsx` — 文字區塊元件（顯示、編輯、拖曳、縮放、刪除）
- `src/hooks/useCustomBlocks.ts` — 管理自訂區塊 state（CRUD、選取、座標轉換）
- `src/hooks/useDragResize.ts` — 滑鼠拖曳移動與縮放共用邏輯
- 更新 `src/app/fill/[id]/page.tsx` — 整合 overlay 到填寫頁
- 更新 `ExportButton` props — 傳遞 customBlocks 給匯出函式

**驗收條件**：
- [ ] 點擊 PDF 預覽空白處，在點擊位置新增一個空文字區塊
      *當前作法：點擊頂部工具列「新增文字」按鈕，區塊置中於頁面，之後可拖曳調整位置*
- [x] 文字區塊顯示邊框與浮動刪除按鈕（hover 或選取時顯示）
- [x] 雙擊文字區塊進入編輯模式（可輸入文字）
- [x] 點擊區塊外或按 Escape 結束編輯，區塊顯示輸入的文字
- [x] 拖曳區塊左側把手可移動位置
- [x] 拖曳區塊右下角調整大小
- [x] 點擊刪除按鈕可移除區塊
- [x] 不同縮放比例下區塊位置正確同步
- [x] 切換 PDF 頁面時，只顯示該頁的區塊
- [ ] 匯出時文字區塊內容正確繪製到 PDF
      *需手動測試：建立文字區塊 → 輸入文字 → 點擊「匯出」按鈕 → 確認 PDF 包含該文字*
- [x] `npx tsc --noEmit` 無錯誤

**依賴關係**：
- US-005a（需 PDF 預覽與填寫頁框架）
- US-010（需 CustomBlock 型別與匯出函式）

**優先級**：P1
**相關功能**：自訂文字區塊（規格新增加 §3.5.1）
