---
name: adjust-styling
description: >-
  Interprets vague visual or layout change requests and updates specified components’ styles after confirming approach and scope with the user. Use when the user asks to 調整樣式、改外觀、改 UI、改顏色／間距／字體、讓畫面更好看、或針對某組件做視覺微調；also when Remotion slides or Tailwind classes need subjective styling changes. Skips confirmation only when the user explicitly waives planning (e.g. 先做再說、直接改、不用問).
---

# Adjust Styling（模糊樣式需求）

在**不擴大重構範圍**的前提下，把使用者的口語化樣式需求轉成具體的 class／樣式變更；預設**先對齊方案與範圍再改碼**。

---

## When to Use / 使用時機

- 使用者用**模糊形容**描述想要的感覺（例如：更舒服、再鬆一點、不要太擠、再醒目一點、偏暗一點）。
- 指定或暗示**某個／某些組件、頁面區塊、Remotion 場景**要改外觀，但沒給精確數值或設計稿。
- 需要**翻譯意圖**成 Tailwind utility、`style`（僅限動態數值）、或專案既有樣式慣例。

**與其他 skill 的分工**

- 若牽涉**大範圍樣式架構重構**（全系統 token、目錄與變數重整），優先考量 **refactor** skill。
- 若為 **Remotion 時間軸／動畫參數**與 best practice，載入 **remotion-best-practices**（見 `AGENTS.md`）。
- 若變更牽涉 **簡報上的品牌／技術堆疊／核心技能圖示**路徑或檔案，對齊 [`build-presentation` 的 `presentation-assets` 規則](../build-presentation/rules/presentation-assets.md) 與 `public/presentation/` 既有資產，避免重複下載或誤用底色版本（`on-light/` vs 根目錄）。

---

## Default Workflow（預設：先問再改）

**在讀取目標檔案並動手修改程式碼之前**，除非符合下方「免確認快速路徑」，否則必須完成本節。

### 1. 釐清「想要的方案」（Approach）

用精簡、可勾選的問題協助使用者選方向（依情境取捨，不必全問）：

| 面向 | 可問的問題（示例） |
|------|---------------------|
| 整體策略 | 要**最小改動**只達成感覺，還是可以**順便微調**鄰近元素以一致？ |
| 視覺語言 | 要偏**現有畫面風格**，還是接受**較明顯**的對比／強調？ |
| 技術偏好 | 優先 **Tailwind class**、專案既有 **design token／變數**，還是在此組件內**例外**處理？ |
| 裝置／情境 | 是否需考慮 **RWD**、暗色／亮色、或 Remotion **輸出解析度**？ |

將使用者回答整理成**一段簡短「共識摘要」**（中文即可），確認無誤後再進入下一步。

### 2. 釐清「想要更改的範圍」（Scope）

在修改前**明確化範圍**，避免誤改：

- **目標**：檔案路徑、組件名稱、或使用者貼上的程式片段／行號。
- **邊界**：只改**單一組件**、**單一區塊**，還是**連動**子元素／兄弟元素？
- **不動**：是否有明確說明不要動的區域（例如：維持 logo 區、維持某段文案樣式）？

若使用者**尚未指定**具體組件，先請其指出（檔案、元件名、或截圖／描述位置），**不要猜測後大範圍修改**。

### 3. 取得確認後再執行

- 用條列或極短段落重述：**方案共識 + 範圍 + 預期可見效果（1～2 句）**。
- **待使用者確認**（或明確說「可以」）後，再開始套用 class／樣式變更。

---

## Fast Path（免確認：使用者明確放寬限制時）

若使用者**明確表示**不必先討論、可先改再說，例如：

- 「不用管細節」「先改再說」「直接改」「不用問我」「你先做一版」
- 英文：`just do it`、`skip the questions`、`don’t ask`

則**可跳過**上述「方案 + 範圍」的往返，直接：

1. 依上下文**合理推斷**目標組件與最小改動。
2. 實作後**簡短說明**改了什麼與假設（方便使用者下一步微調）。

若仍**完全無法**鎖定要改哪個組件，即使走快速路徑，也應**只問最少必要的一題**（例如：哪個檔案或哪個畫面）。

---

## Implementation Notes（實作要點）

- 若使用者描述「**字太小**」「**留白太多／太空**」或類似可讀性問題：先對照簡報專用的 [build-presentation/rules/typography-density.md](../build-presentation/rules/typography-density.md)（密度階梯、px 參考區間、反模式），再調 class；避免只加大 padding 卻維持過小字級。
- **優先**與專案一致：Tailwind、`cn()`（見 `src/lib/utils.ts`）、既有 spacing／字級階層；避免大段裸 `style={{}}`，除非動態數值或官方建議。
- **口語 → 具體**：將模糊詞對應到可操作的屬性（例：擠 → gap/padding；不醒目 → contrast／font-weight／size；不舒服 → line-height／max-width／留白）。
- **克制**：只改與需求相關的樣式；不順手重構無關邏輯或刪除註解。
- **Remotion**：動畫數值仍用 `interpolate`／`spring` 等 API；Tailwind 與 Remotion 限制依專案 remotion 技能中的 `rules/tailwind.md`。

---

## Examples

**例一（預設流程）**

- 使用者：「讓這張投影片標題看起來更有氣勢一點。」
- 代理：先問**方案**（要強調字重／尺寸／對比／動畫？）與**範圍**（僅標題文字或含副標？哪個 composition／檔案？），確認後再改 `className` 或動畫參數。

**例二（快速路徑）**

- 使用者：「`Hero.tsx` 按鈕太醜，直接改好看，不用問。」
- 代理：可逕行調整該按鈕相關樣式，並在結尾說明採用的視覺假設。

---

## When Not to Overuse

- 純**概念解釋**（「什麼是 line-height？」）不必啟動完整流程；直接回答即可。
- 使用者已給**精確規格**（像素、色碼、Figma token）且範圍清楚時，可直接實作，但仍應一句話確認「只改 X 檔案／Y 區塊」以避免誤會。
