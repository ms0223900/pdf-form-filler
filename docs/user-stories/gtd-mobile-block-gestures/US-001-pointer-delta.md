### US-001：實作 Pointer 位移轉換

**作為** 開發者
**我想要** 抽出與裝置無關的位移轉換函式
**以便** 滑鼠與觸控共用同一套 PDF 座標更新

**輸入格式**：
- US-001-test 的紅燈測試與既定函式簽名
- 現有 `useDragResize` 的 `move`／`resize` 公式

**輸出格式**：
- `src/lib/pointerDelta.ts` 的 `applyPointerDelta`
- US-001-test 轉綠
- 本任務不改 React hook 事件綁定（那是 US-003）

**驗收條件**：
- [ ] US-001-test 全部轉綠
- [ ] 公式與現有 hook 一致：move 為 `(x + dx/scale, y - dy/scale)`；resize 套 60×30 下限
- [ ] 不修改 `TextBlock`／`ImageBlock` 的 UI 事件

**測試策略**：Test-First
> 理由：對 US-001-test 紅燈實作至綠；純座標邏輯適合先測後寫。

**依賴關係**：US-001-test

**優先級**：P0
**相關功能**：自訂區塊拖曳／縮放
