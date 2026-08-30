# GTD — 手機版區塊移動與縮放

來源：[GTD【PDF Form Filler】改善手機版區塊移動與縮放](https://app.notion.com/p/penguin-cho/GTD-PDF-Form-Filler-ab5e1d05e1b94987b9df778ef22c9e4b)

## 範圍說明

手機無法移動或縮放簽名、文字、圖片區塊。根因是 `useDragResize` / `useAspectRatioResize` 與 `TextBlock` / `ImageBlock` 只綁 `mousedown`／`mousemove`／`mouseup`。簽名疊加為 `CustomImageBlock`（走 `ImageBlock`）。桌機既有滑鼠操作必須維持。

本目錄對應 Notion 完成標準：三種區塊可拖曳與縮放、過程即時、結束後位置尺寸保留、不破壞桌機。

## 全域驗收 Checklist

### Phase 1 — 座標／縮放純邏輯

- [x] US-001-test 撰寫 Pointer 位移轉換單元測試（預期紅燈；待實作轉綠）
- [x] US-001 實作 Pointer 位移轉換
- [x] US-002-test 撰寫雙指 pinch 縮放單元測試（預期紅燈；待實作轉綠）
- [x] US-002 實作雙指 pinch 縮放計算

### Phase 2 — Hook 與區塊接線

- [x] US-003 將拖曳／縮放 hooks 改為 Pointer Events 並鎖定捲動
- [ ] US-004 文字區塊接上觸控拖曳與縮放
- [ ] US-005 圖片與簽名區塊接上觸控拖曳與縮放

### Phase 3 — 驗收

- [ ] US-006 常見手機尺寸與桌機回歸驗收

## 重構掃描記錄

- 已掃描至：US-003（2026-08-30）
- 已知待觀察熱點：無
- 本次結論：低風險（掃描範圍僅 US-003；hooks／overlay 首次改動，無 churn hotspot／反模式）

## 依賴鏈摘要

```
US-001-test ─────► US-001
US-002-test ─────► US-002

US-001 ─┐
        ├─► US-003
US-002 ─┘
          ├─► US-004
          └─► US-005
                │
US-004 ─┐
        ├─► US-006
US-005 ─┘
```

## US 列表

| 編號 | 標題 | 優先級 | 依賴 | 測試策略 |
|------|------|--------|------|----------|
| US-001-test | 撰寫 Pointer 位移轉換單元測試 | P0 | — | 純測試（預期紅燈）✅ |
| US-001 | 實作 Pointer 位移轉換 | P0 | US-001-test | Test-First ✅ |
| US-002-test | 撰寫雙指 pinch 縮放單元測試 | P0 | — | 純測試（預期紅燈）✅ |
| US-002 | 實作雙指 pinch 縮放計算 | P0 | US-002-test | Test-First ✅ |
| US-003 | hooks 改 Pointer Events 並鎖定捲動 | P0 | US-001, US-002 | Test-After |
| US-004 | 文字區塊觸控拖曳與縮放 | P0 | US-003 | Test-After |
| US-005 | 圖片與簽名區塊觸控拖曳與縮放 | P0 | US-003 | Test-After |
| US-006 | 常見手機尺寸與桌機回歸驗收 | P0 | US-004, US-005 | Test-After |

## 開發順序

```
US-001-test → US-001
US-002-test → US-002   （可與 US-001 家族平行）
→ US-003 → US-004 與 US-005（可平行）→ US-006
```
