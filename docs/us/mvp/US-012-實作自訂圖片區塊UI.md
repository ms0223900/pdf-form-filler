### US-012：實作自訂圖片區塊 UI

**作為** 使用者
**我想要** 上傳圖片（印章、簽名圖檔、Logo）並放置到 PDF 的任意位置，可調整大小後刪除
**以便** 在 PDF 中加入圖片類的標記

**輸入格式**：
- 使用者從本機選取的圖片檔案（PNG / JPG）
- 使用者點擊的 PDF 頁面位置（x/y 座標）
- 使用者設定的圖片尺寸（寬高）

**輸出格式**：
- `src/components/ImageBlock.tsx` — 圖片區塊元件（上傳、顯示、拖曳、縮放、刪除）
- 更新 `src/components/CustomBlockOverlay.tsx` — 整合圖片區塊渲染
- 更新 `src/components/Toolbar.tsx` 或填寫頁頂部工具列 — 「新增圖片區塊」按鈕
- 更新 `src/app/fill/[id]/page.tsx` — 整合圖片區塊新增流程

**驗收條件**：
- [x] 點擊「新增圖片」按鈕或從選單觸發，開啟檔案選擇對話框
- [x] 選取圖片後，圖片以區塊形式出現在 PDF 預覽畫面的中心位置
- [x] 圖片區塊顯示虛線邊框與浮動工具列（刪除按鈕）
- [x] 拖曳圖片區塊可移動位置
- [x] 拖曳右下角可等比例調整大小
- [x] 點擊刪除按鈕可移除圖片區塊
- [x] 支援 PNG（含透明背景）與 JPG 格式
- [x] 不同縮放比例下圖片區塊位置正確同步
- [x] 切換 PDF 頁面時，只顯示該頁的區塊
- [x] 匯出時圖片正確嵌入 PDF 指定位置（png 用 embedPng，jpg 用 embedJpg）
- [x] `npx tsc --noEmit` 無錯誤

**依賴關係**：
- US-010（需 CustomBlock 型別與匯出函式）
- US-011（需 CustomBlockOverlay 與 useDragResize 共用基礎架構）

**優先級**：P1
**相關功能**：自訂圖片區塊（規格新增加 §3.5.2）

#### 驗收說明

**整體結論**：PASS ✅

> 所有驗收條件均已完成。新增 `ImageBlock.tsx` 作為圖片區塊元件，支援拖曳移動、等比例縮放、刪除；`CustomBlockOverlay` 整合圖片區塊渲染；填寫頁工具列新增「新增圖片」按鈕及隱藏式檔案輸入，支援 PNG/JPG 格式選擇與 base64 讀取；匯出流程由 US-010 `embedCustomBlocks` 覆蓋（`embedPng`/`embedJpg`）。

---

**AC-1：點擊「新增圖片」按鈕開啟檔案選擇對話框**

狀態：✅ 通過

- `src/app/fill/[id]/page.tsx:196-204` 新增「新增圖片」按鈕，點擊觸發隱藏 `<input type="file" accept="image/png,image/jpeg">`

---

**AC-2：選取圖片後以區塊形式出現在頁面中心**

狀態：✅ 通過

- `src/app/fill/[id]/page.tsx:104-122` 的 `handleImageFileChange` 使用 `FileReader.readAsDataURL` 讀取檔案，再呼叫 `addImageBlock` 建立置中區塊
- `src/hooks/useCustomBlocks.ts:35-53` 的 `addImageBlock` 將區塊置於 `(pageWidth/2 - 80, pageHeight/2 - 40)`，預設 160×120（4:3）

---

**AC-3：圖片區塊顯示虛線邊框與浮動刪除按鈕**

狀態：✅ 通過

- `src/components/ImageBlock.tsx:119-127` 非選取時使用 `border-dashed border-gray-400`，選取時使用 `border-blue-500` 實線
- `src/components/ImageBlock.tsx:150-159` 右上角刪除按鈕，預設 `opacity-0`，hover/選取時顯示

---

**AC-4：拖曳圖片區塊可移動位置**

狀態：✅ 通過

- `src/components/ImageBlock.tsx:77-81` 左側把手 `onMouseDown` 使用 `useDragResize` 的 `handleMouseDown` 進行拖曳移動
- 座標轉換與 TextBlock 共用相同 `useDragResize` 機制

---

**AC-5：拖曳右下角可等比例調整大小**

狀態：✅ 通過

- `src/components/ImageBlock.tsx:83-106` 自訂 `handleResizeStart`，在 mousemove 中根據 `aspectRatioRef` 計算等比例寬高，最小寬度 80px
- `useLayoutEffect` 在圖片載入時從 `img.naturalWidth / img.naturalHeight` 取得原始比例

---

**AC-6：點擊刪除按鈕可移除圖片區塊**

狀態：✅ 通過

- `src/components/ImageBlock.tsx:69-75` 點擊刪除按鈕呼叫 `onRemove(block.id)`，由 `useCustomBlocks` 的 `removeBlock` 處理移除

---

**AC-7：支援 PNG（含透明背景）與 JPG 格式**

狀態：✅ 通過

- `src/app/fill/[id]/page.tsx:112` 根據 `file.type` 判斷為 `'png'` 或 `'jpeg'`，傳入 `addImageBlock` 的 `imageType` 參數
- `src/components/ImageBlock.tsx:169` 的 `<img>` 標籤天然支援 PNG 透明背景

---

**AC-8：不同縮放比例下圖片區塊位置正確同步**

狀態：✅ 通過

- `src/components/ImageBlock.tsx:37-41` 使用與 TextBlock 相同的座標轉換公式（PDF points × scale、Y 軸翻轉）
- 共用 `useDragResize` 的 `/ scale` 回存機制

---

**AC-9：切換 PDF 頁面時只顯示該頁的區塊**

狀態：✅ 通過

- `src/components/CustomBlockOverlay.tsx:56` 使用 `blocks.filter((b) => b.page === pageIndex)` 過濾當前頁面區塊

---

**AC-10：匯出時圖片正確嵌入 PDF**

狀態：✅ 通過

- 由 US-010 的 `src/lib/pdfUtils.ts:78-103` 的 `embedCustomBlocks` 處理，使用 `embedPng()` / `embedJpg()` + `drawImage()`

---

**AC-11：`npx tsc --noEmit` 無錯誤**

狀態：✅ 通過

- `npx tsc --noEmit` 執行無任何輸出，型別檢查完全通過
