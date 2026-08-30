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
- [ ] US-001-test 全部轉綠
- [ ] `renderPage` 仍渲染 canvas 與 `renderOverlay`
- [ ] `renderPage` 不渲染 text layer、annotation layer
- [ ] 分頁與縮放工具列行為不變

**測試策略**：Test-First
> 理由：對 US-001-test 紅燈實作至綠；圖層選擇為明確邏輯。

**依賴關係**：US-001-test

**優先級**：P0
**相關功能**：PDF 預覽（spec §3.2、US-005a）
