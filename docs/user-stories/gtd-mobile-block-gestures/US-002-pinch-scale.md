### US-002：實作雙指 pinch 縮放計算

**作為** 開發者
**我想要** 把兩指距離變化轉成區塊新尺寸
**以便** 簽名、文字、圖片在手機上可 pinch 縮放

**輸入格式**：
- US-002-test 的紅燈測試與既定函式簽名

**輸出格式**：
- `src/lib/pinchScale.ts` 的 `applyPinchScale`
- US-002-test 轉綠
- 本任務不接 Pointer 事件（那是 US-003）

**驗收條件**：
- [x] US-002-test 全部轉綠
- [x] 支援自由縮放與鎖定長寬比兩種模式
- [x] 不修改區塊元件 UI

**測試策略**：Test-First
> 理由：對 US-002-test 紅燈實作至綠。

**依賴關係**：US-002-test

**優先級**：P0
**相關功能**：手機雙指縮放區塊

#### 驗收說明

**整體結論**：PASS ✅

> `applyPinchScale` 已實作，US-002-test 6 案全綠；未改區塊 UI。

---

**AC-1：US-002-test 全部轉綠**

狀態：✅ 通過

- `npx vitest run src/lib/pinchScale.test.ts`：6 passed
- `npx tsc --noEmit` 通過

---

**AC-2：支援自由縮放與鎖定長寬比**

狀態：✅ 通過

- `src/lib/pinchScale.ts` 的 `applyPinchScale()`：以 `currentDistance / startDistance` 縮放；`lockAspectRatio` 時維持 `initW/initH` 比例後再套 60×30 下限
- 無效距離（0／非有限值）回傳原尺寸，避免 NaN／Infinity

---

**AC-3：不修改區塊元件 UI**

狀態：✅ 通過

- 本任務只新增 `src/lib/pinchScale.ts`
- `TextBlock`／`ImageBlock` 仍為 `onMouseDown`（US-003 範圍）
