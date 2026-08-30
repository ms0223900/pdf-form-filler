### US-001：預覽只渲染 canvas，不渲染擷取內容層

**作為** 填寫頁使用者
**我想要** PDF 預覽只顯示頁面點陣圖，不要 RPV 擷取文字／註解再疊一層 HTML
**以便** 避免擷取內容層干擾自訂區塊操作，並減少多餘渲染

**輸入格式**：
- US-001-test 的紅燈測試
- `src/components/PDFViewer.tsx` 既有 `renderPage`

**輸出格式**：
- `src/lib/pdfViewerLayers.ts` 的 `getPdfViewerPageLayers`
- `PDFViewer` 只掛白名單內的圖層，仍保留自訂 overlay
- US-001-test 轉綠

**驗收條件**：
- [x] US-001-test 全部轉綠
- [x] `renderPage` 仍渲染 canvas 與 `renderOverlay`
- [x] `renderPage` 不渲染 text layer、annotation layer
- [x] 分頁與縮放工具列行為不變

**測試策略**：Test-First
> 理由：對 US-001-test 紅燈實作至綠；圖層選擇為明確邏輯。

**依賴關係**：US-001-test

**優先級**：P0
**相關功能**：PDF 預覽（spec §3.2、US-005a）

#### 驗收說明

**整體結論**：PASS ✅

> 白名單僅 canvas；填寫頁 Puppeteer：`.rpv-core__text-layer` / annotation 為 0、canvas ≥1；分頁 1/2→2/2、縮放 120%、新增文字 overlay「按兩下編輯」。略過 text layer 時用 `markRendered` 推進佇列。

---

**AC-1：US-001-test 全部轉綠**

狀態：✅ 通過

- `npx vitest run` 含 `pdfViewerLayers.test.ts` 全綠

---

**AC-2：仍渲染 canvas 與 overlay**

狀態：✅ 通過

- `src/components/PDFViewer.tsx` 的 `renderPage` 掛 `canvasLayer` 與 `renderOverlay`
- 瀏覽器：canvas 存在；「新增文字」後可見「按兩下編輯」

---

**AC-3：不渲染 text／annotation layer**

狀態：✅ 通過

- `getPdfViewerPageLayers()` 只回 `canvas`
- DOM：`.rpv-core__text-layer` 與 `.rpv-core__annotation-layer` 皆為 0

---

**AC-4：分頁與縮放工具列行為不變**

狀態：✅ 通過

- 工具列仍為 1/2 → 下一頁 2/2；放大後顯示 120%
