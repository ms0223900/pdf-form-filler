### US-013：擴充 CustomImageBlock 型別與 ImageBlock 浮水印 UI

**作為** 使用者
**我想要** 在圖片區塊上啟用浮水印，文字蓋在圖片靠近底部的位置
**以便** 標示圖片用途，防止被濫用

**輸入格式**：
- 現有 `CustomImageBlock` 型別（`lib/types.ts`）
- 現有 `ImageBlock` 元件（`components/ImageBlock.tsx`）
- 預設浮水印文字：「本證件僅供核對身分專用，複製或轉作其他用途無效」

**輸出格式**：
- 更新 `lib/types.ts` — `CustomImageBlock` 增加 `watermark` 欄位（`{ enabled: boolean; text: string }`）
- 更新 `src/components/ImageBlock.tsx` — 啟用浮水印時在圖片上方疊加半透明文字
- 新增或更新填寫頁工具列/區塊控制項 — 圖片區塊的浮水印開關

**驗收條件**：
- [x] `CustomImageBlock` 新增 `watermark?: { enabled: boolean; text: string }` 欄位
- [x] 圖片區塊被選取時，出現浮水印開關（如按鈕或 toggle），預設為「關閉」
- [x] 啟用浮水印時，圖片區塊上立即顯示浮水印文字，位置在圖片底部（距離底部約 10% 區塊高度）
- [x] 浮水印文字為半透明（如 rgba(255,0,0,0.5)）、適當字級（依區塊高度等比縮放），垂直置中於底部區域
- [x] 關閉浮水印時，浮水印文字立即消失
- [x] 切換頁面、縮放、拖曳圖片後，浮水印仍正確顯示
- [x] 未選取圖片區塊時，浮水印仍維持顯示（不因失焦而消失）
- [x] `npx tsc --noEmit` 無錯誤

**依賴關係**：
- US-012（ImageBlock 元件已存在）

**優先級**：P1
**相關功能**：圖片區塊（spec §3.5.2）
