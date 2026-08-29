### US-003：將拖曳／縮放 hooks 改為 Pointer Events 並鎖定捲動

**作為** 手機使用者
**我想要** 在區塊上拖曳或 pinch 時頁面不要跟著捲動
**以便** 只移動／縮放區塊本身

**輸入格式**：
- `src/hooks/useDragResize.ts`、`src/hooks/useAspectRatioResize.ts`
- US-001 的 `applyPointerDelta`、US-002 的 `applyPinchScale`
- PointerEvent：`pointerdown`／`pointermove`／`pointerup`／`pointercancel`；雙指 pinch 用第二個 pointer

**輸出格式**：
- 兩個 hook 改吃 Pointer（不再只聽 `mousedown`／`mousemove`／`mouseup`）
- 進行中：`setPointerCapture`、`touch-action: none` 或等價 `preventDefault`，避免畫布／頁面捲動
- 單指拖曳即時 `onMove`；單指／把手縮放即時 `onResize`；雙指 pinch 即時套用 `applyPinchScale`
- hook 對外 API 改為 `onPointerDown`（或同時相容舊名稱並轉發 Pointer）
- `npx tsc --noEmit` 通過

**驗收條件**：
- [ ] 觸控單指拖曳會更新區塊座標（不依賴滑鼠事件）
- [ ] 觸控縮放（把手或 pinch）會更新區塊尺寸
- [ ] 拖曳／縮放進行中，PDF 畫布與頁面不因該手勢捲動
- [ ] 桌機滑鼠拖曳與右下角縮放行為與改前相同
- [ ] `pointercancel`／`pointerup` 會結束手勢並釋放 capture

**測試策略**：Test-After
> 理由：事件綁定、capture 與捲動鎖定屬瀏覽器手勢，純函式測不到；先接線再以瀏覽器驗。

**依賴關係**：US-001、US-002

**優先級**：P0
**相關功能**：手勢與頁面捲動衝突（Notion 細項）
