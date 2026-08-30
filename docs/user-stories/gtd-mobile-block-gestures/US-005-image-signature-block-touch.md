### US-005：圖片與簽名區塊接上觸控拖曳與縮放

**作為** 手機使用者
**我想要** 用手指移動並縮放圖片與簽名
**以便** 證件照與簽名能對準欄位

**輸入格式**：
- `src/components/ImageBlock.tsx`（簽名與圖片皆為 `type: 'image'`）
- US-003 的 Pointer hook API
- 兩條入口：工具列新增圖片；簽名工具／素材庫加入的簽名圖

**輸出格式**：
- `ImageBlock` 拖曳與等比例縮放改綁 Pointer
- 支援單指拖曳、把手縮放、雙指 pinch（鎖定長寬比）
- 過程即時反映；手指離開後 `x/y/width/height` 保留
- 浮水印開關與刪除在觸控下仍可用

**驗收條件**：
- [x] 手機上可拖曳一般圖片區塊
- [x] 手機上可拖曳簽名區塊（簽名工具或素材庫放入者）
- [x] 上述兩種皆可縮放，且大致維持長寬比
- [x] 手指離開後位置與尺寸不變
- [x] 不影響桌機圖片／簽名拖曳與等比例縮放

**測試策略**：Test-After
> 理由：與 US-004 相同，屬觸控 UI 接線；簽名與圖片共用 `ImageBlock`，一次接線兩條使用者路徑都要驗。

**依賴關係**：US-003

**優先級**：P0
**相關功能**：自訂圖片區塊（US-012）、簽名工具（US-006b）

#### 驗收說明

**整體結論**：PASS ✅

> `ImageBlock` 已接 Pointer；填寫頁一般圖片與簽名工具放入的簽名皆可拖／縮且鎖比例。多尺寸回歸屬 US-006。

---

**AC-1：手機上可拖曳一般圖片區塊**

狀態：✅ 通過

- `src/components/ImageBlock.tsx`：本體與左側把手 `onPointerDown` → `handleDragStart()` → overlay `handleImagePointerDown`（`mode: 'move'`）
- 外層 `touch-none`；390×844 單指拖橙色圖片，區塊移動、頁面不捲動

---

**AC-2：手機上可拖曳簽名區塊**

狀態：✅ 通過

- 簽名工具「使用簽名」走同一 `addImageBlock`／`ImageBlock`
- 390×844 單指拖簽名區塊，區塊移動、頁面不捲動

---

**AC-3：兩種皆可縮放且大致維持長寬比**

狀態：✅ 通過

- 右下角 `useAspectRatioResize` 的 `handleResizeStart()`（寬度驅動、高度＝寬／比例）
- overlay 圖片 hook `lockAspectRatio: true`，pinch 走 `applyPinchScale`
- 桌機拉角：約 175×130 → 290×215（約 1.35:1）

---

**AC-4：手指離開後位置與尺寸不變**

狀態：✅ 通過

- `pointerup` 後 `useCustomBlocks.updateBlock` 的 x/y/width/height 仍在
- 圖片與簽名放開後都停在新位置／新尺寸

---

**AC-5：不影響桌機圖片／簽名拖曳與等比例縮放**

狀態：✅ 通過

- 滑鼠可拖本體、拖右下角；浮水印鈕與刪除改 `onPointerDown`，選取時可見且可切換浮水印

---

**後續建議**

- 簽名板 `canSave` 只在 re-render 時重算，畫完可能仍 disable，需再點「儲存至素材庫」才亮（既有問題，非本 US）
- US-006 再做 360／390／430 與桌機回歸
