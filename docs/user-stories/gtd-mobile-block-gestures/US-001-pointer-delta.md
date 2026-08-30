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
- [x] US-001-test 全部轉綠
- [x] 公式與現有 hook 一致：move 為 `(x + dx/scale, y - dy/scale)`；resize 套 60×30 下限
- [x] 不修改 `TextBlock`／`ImageBlock` 的 UI 事件

**測試策略**：Test-First
> 理由：對 US-001-test 紅燈實作至綠；純座標邏輯適合先測後寫。

**依賴關係**：US-001-test

**優先級**：P0
**相關功能**：自訂區塊拖曳／縮放

#### 驗收說明

**整體結論**：PASS ✅

> `applyPointerDelta` 已抽出，US-001-test 4 案全綠；未改區塊 UI 事件。

---

**AC-1：US-001-test 全部轉綠**

狀態：✅ 通過

- `npx vitest run src/lib/pointerDelta.test.ts`：4 passed
- `npx tsc --noEmit` 通過

---

**AC-2：公式與現有 hook 一致**

狀態：✅ 通過

- `src/lib/pointerDelta.ts` 的 `applyPointerDelta()`：`dx/dy` 除以 `scale`；move 為 `initX + dx`、`initY - dy`；resize 為 `Math.max(60, initW + dx)`、`Math.max(30, initH + dy)`
- 與 `src/hooks/useDragResize.ts` 的 `handleMouseMove` 公式一致

---

**AC-3：不修改 TextBlock／ImageBlock 的 UI 事件**

狀態：✅ 通過

- 本任務只新增 `src/lib/pointerDelta.ts`
- `TextBlock`／`ImageBlock` 仍為 `onMouseDown`（US-003 範圍）
