### US-002-test：撰寫雙指 pinch 縮放單元測試

**作為** 開發者
**我想要** 先寫會失敗的雙指 pinch 測試
**以便** 手機縮放區塊有明確的距離→尺寸對應

**輸入格式**：
- 兩指起始距離、目前距離、區塊初始 `width/height`
- 可選：鎖定長寬比（圖片／簽名要、文字不要）
- 最小寬 60、最小高 30

**輸出格式**：
- `src/lib/pinchScale.test.ts`
- 測 `applyPinchScale`（函式可尚未存在）

**驗收條件**：
- [x] 聚焦測試因功能尚未實作而預期紅燈
- [x] 距離變大 → 寬高變大；距離變小 → 寬高變小
- [x] 鎖定長寬比時 `width/height` 比值不變（在下限允許內）
- [x] 結果不低於 60×30
- [x] 兩指距離為 0 或無效時不產生 NaN／Infinity

**測試策略**：純測試準備
> 理由：pinch 是明確的距離比例計算，適合先紅後綠。

**依賴關係**：無（可與 US-001-test 平行；共用 Vitest 時沿用已有設定）

**優先級**：P0
**相關功能**：手機雙指縮放區塊

#### 驗收說明

**整體結論**：PREPARED：預期紅燈測試已建立

> `npx vitest run src/lib/pinchScale.test.ts` 失敗：`Cannot find module './pinchScale'`（`applyPinchScale` 尚未實作）。Vitest 可跑，失敗原因不是設定或測試語法錯誤。

- 路徑：`src/lib/pinchScale.test.ts`
- 涵蓋：距離變大／變小、`lockAspectRatio` 維持比例、60×30 下限、距離 0／NaN 須為有限值
- 待 US-002 實作 `src/lib/pinchScale.ts` 後轉綠
