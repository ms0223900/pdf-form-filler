### US-004：文字區塊接上觸控拖曳與縮放

**作為** 手機使用者
**我想要** 用手指移動並縮放文字區塊
**以便** 在手機上把文字放到正確位置與大小

**輸入格式**：
- `src/components/TextBlock.tsx`
- US-003 已提供的 Pointer hook API
- 填寫頁上既有文字區塊（工具列「新增文字」）

**輸出格式**：
- `TextBlock` 把手與右下角改綁 Pointer（不再只 `onMouseDown`）
- 區塊本體可單指拖曳、雙指 pinch 縮放（文字為自由比例）
- 過程即時反映；手指離開後座標與寬高留在 state（`useCustomBlocks.updateBlock`）
- 雙擊編輯、刪除仍可用（觸控裝置可用既有或等效手勢）

**驗收條件**：
- [x] 手機上可拖曳文字區塊，畫面即時跟著走
- [x] 手機上可縮放文字區塊（把手或 pinch）
- [x] 手指離開後位置與尺寸不變
- [x] 不影響桌機文字區塊拖曳／縮放／編輯

**測試策略**：Test-After
> 理由：元件事件接線與觸控手感屬 UI，適合實作後用裝置／模擬器驗。

**依賴關係**：US-003

**優先級**：P0
**相關功能**：自訂文字區塊（US-011）；Notion 細項「文字區塊」

#### 驗收說明

**整體結論**：PASS ✅

> `TextBlock` 已接 Pointer；填寫頁桌機拖曳／縮放／編輯與 390 視窗單指拖曳通過。圖片／簽名仍屬 US-005。

---

**AC-1：手機上可拖曳文字區塊，畫面即時跟著走**

狀態：✅ 通過

- `src/components/TextBlock.tsx`：本體與左側把手 `onPointerDown` → `handleDragStart()` → US-003 `handlePointerDown`（`mode: 'move'`）
- 外層 `touch-none`；390×844 視窗單指拖曳區塊會跟著走、頁面不捲動

---

**AC-2：手機上可縮放文字區塊（把手或 pinch）**

狀態：✅ 通過

- 右下角 `onPointerDown` → `handleResizeStart()`（`mode: 'resize'`）
- 本體第一指進入 hook 後，第二指走既有 `applyPinchScale()`（自由比例）
- 桌機拖右下角可即時放大（約 175×60 → 260×95）

---

**AC-3：手指離開後位置與尺寸不變**

狀態：✅ 通過

- `pointerup` 結束手勢後，`useCustomBlocks.updateBlock` 已寫入的 x/y/width/height 仍在
- 填寫頁驗證：放開後區塊停在新位置／新尺寸

---

**AC-4：不影響桌機文字區塊拖曳／縮放／編輯**

狀態：✅ 通過

- 滑鼠 pointer 可拖本體、拖右下角、雙擊進入編輯並輸入後仍可再拖
- 編輯中本體不綁 drag，左側把手仍可拖；刪除鈕改 `onPointerDown`

---

**後續建議**

- `ImageBlock` 仍為 `onMouseDown`，由 US-005 接線
