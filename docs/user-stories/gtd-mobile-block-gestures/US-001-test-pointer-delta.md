### US-001-test：撰寫 Pointer 位移轉換單元測試

**作為** 開發者
**我想要** 先寫會失敗的位移轉換測試
**以便** 後續把滑鼠／觸控座標換成 PDF 座標時有明確紅燈

**輸入格式**：
- `scale`、起始 client 座標、目前 client 座標、區塊初始 `x/y/width/height`
- mode：`move` 或 `resize`
- 既有下限：resize 最小寬 60、最小高 30（PDF points）

**輸出格式**：
- 若專案尚無 runner：補上 Vitest（`package.json` script、`vitest.config.ts`、`@` alias）
- `src/lib/pointerDelta.test.ts`（或專案慣用路徑）
- 測 `applyPointerDelta`（函式可尚未存在）

**驗收條件**：
- [ ] 聚焦測試因功能尚未實作而預期紅燈
- [ ] `move`：`dx/scale` 加到 `x`；`dy/scale` 從 `y` 減去（與現有 `useDragResize` 一致）
- [ ] `resize`：寬高加上 `dx/scale`、`dy/scale`，且不低於 60×30
- [ ] `scale !== 1` 時位移按比例換算
- [ ] `npm test`（或等價指令）可跑、且上述案例因未實作而失敗（非設定錯誤）

**測試策略**：純測試準備
> 理由：座標轉換是明確 input/output，先鎖行為再實作。

**依賴關係**：無

**優先級**：P0
**相關功能**：`useDragResize` 座標換算（US-011）
