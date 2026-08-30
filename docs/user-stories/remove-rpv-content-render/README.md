# 移除 RPV 擷取 PDF 內容層

## 範圍說明

`@react-pdf-viewer` 自訂 `renderPage` 目前會掛上 **text layer** 與 **annotation layer**。這兩層會擷取 PDF 文字／註解並渲染成 HTML，與填寫頁自訂區塊疊加無關，還可能攔截指標事件。本目錄只拿掉這兩層，**保留 canvas 點陣頁面與 overlay**。

## 全域驗收 Checklist

### Phase 1

- [ ] US-001-test 撰寫頁面圖層白名單單元測試（預期紅燈；待實作轉綠）
- [ ] US-001 預覽只渲染 canvas，不渲染擷取內容層

## 依賴鏈摘要

```
US-001-test ─────► US-001
```

## US 列表

| 編號 | 標題 | 優先級 | 依賴 | 測試策略 |
|------|------|--------|------|----------|
| US-001-test | 撰寫頁面圖層白名單單元測試 | P0 | — | 純測試（預期紅燈） |
| US-001 | 預覽只渲染 canvas | P0 | US-001-test | Test-First |
