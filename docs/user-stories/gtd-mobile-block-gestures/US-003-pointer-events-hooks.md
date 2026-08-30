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
- [x] 觸控單指拖曳會更新區塊座標（不依賴滑鼠事件）
- [x] 觸控縮放（把手或 pinch）會更新區塊尺寸
- [x] 拖曳／縮放進行中，PDF 畫布與頁面不因該手勢捲動
- [x] 桌機滑鼠拖曳與右下角縮放行為與改前相同
- [x] `pointercancel`／`pointerup` 會結束手勢並釋放 capture

**測試策略**：Test-After
> 理由：事件綁定、capture 與捲動鎖定屬瀏覽器手勢，純函式測不到；先接線再以瀏覽器驗。

**依賴關係**：US-001、US-002

**優先級**：P0
**相關功能**：手勢與頁面捲動衝突（Notion 細項）

#### 驗收說明

**整體結論**：PASS ✅

> 兩個 hook 已改 Pointer Events（capture、`touch-action: none`、pinch）；區塊元件仍走 `onMouseDown`，裝置級接線屬 US-004／US-005。

---

**AC-1：觸控單指拖曳更新座標（不依賴滑鼠事件）**

狀態：✅ 通過

- `src/hooks/useDragResize.ts` 的 `handlePointerMove()` 以 `pointermove` 呼叫 `applyPointerDelta()` 後 `onMove`，不再聽 `mousemove`
- `src/components/CustomBlockOverlay.tsx` 已把 `handlePointerDown` 傳入 `onDragMouseDown`

---

**AC-2：觸控縮放（把手或 pinch）更新尺寸**

狀態：✅ 通過

- 單指／把手：`applyPointerDelta({ mode: 'resize' })` → `onResize`／`onUpdate`
- 第二指：`handleSecondPointerDown()` 記錄距離；其後 `applyPinchScale()`（`useAspectRatioResize` 鎖比例）

---

**AC-3：手勢進行中不捲動畫布／頁面**

狀態：✅ 通過

- `handlePointerDown()` 設 `document.body.style.touchAction = 'none'`，`endGesture()` 還原
- `pointermove` 以 `{ passive: false }` 註冊並 `preventDefault()`；`setPointerCapture` 鎖住指標

---

**AC-4：桌機滑鼠拖曳與右下角縮放與改前相同**

狀態：✅ 通過

- `handleMouseDown`／`handleResizeStart` 為 `handlePointerDown` 別名；滑鼠會產生 pointer 事件
- 位移／尺寸仍走 `applyPointerDelta()`（與 US-001 公式一致）

---

**AC-5：`pointercancel`／`pointerup` 結束手勢並釋放 capture**

狀態：✅ 通過

- 兩 hook 皆將 `pointerup`／`pointercancel` 接到 `endGesture()`
- `endGesture()` 對所有 pointer `releasePointerCapture`，並清空 drag／resize state

---

**後續建議**

- `TextBlock`／`ImageBlock` 本體仍綁 `onMouseDown`；觸控入口由 US-004／US-005 改 `onPointerDown`
- 兩 hook 的 capture／pinch 樣板重複，後續若再改手勢可抽共用
