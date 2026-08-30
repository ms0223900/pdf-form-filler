### US-001-test：撰寫頁面圖層白名單單元測試

**作為** 開發者
**我想要** 先鎖定「預覽頁不渲染 RPV 擷取內容層」的預期
**以便** US-001 實作時有明確紅燈轉綠訊號

**輸入格式**：
- 既定函式：`src/lib/pdfViewerLayers.ts` 的 `getPdfViewerPageLayers`

**輸出格式**：
- `src/lib/pdfViewerLayers.test.ts`

**驗收條件**：
- [ ] 已建立測試檔且確認預期紅燈（因功能尚未實作）
- [ ] 斷言回傳僅含 `canvas`，不含 `text`、`annotation`

**測試策略**：純測試（預期紅燈）
> 理由：圖層白名單是明確 input/output，適合先寫失敗測試。

**依賴關係**：無

**優先級**：P0
**相關功能**：PDF 預覽（US-005a）
