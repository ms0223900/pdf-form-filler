# PDF Form Filler — 技術規格書

## 1. 專案概述

瀏覽器端運作的 PDF 線上填表工具。使用者上傳或選擇既有 AcroForm 表單 PDF，自動偵測欄位後產生對應的填寫介面，填寫完成後可匯出已填寫的 PDF。個人常用資料與簽名儲存於本地瀏覽器，無需後端伺服器。

### 核心價值
- 不需安裝任何桌面軟體
- 所有資料儲存在本地，無隱私外洩疑慮
- 可重複使用的個人資料素材庫

---

## 2. 技術架構

### 前端框架
- **Next.js 14** (App Router, TypeScript)
- 全站為 Client Components（PDF 操作套件僅支援瀏覽器環境）

### 核心套件

| 套件 | 版本 | 用途 |
|------|------|------|
| pdf-lib | latest | 讀取 AcroForm 欄位定義、寫入填寫內容、匯出 PDF |
| @react-pdf-viewer/core | latest | PDF 頁面渲染（基於 PDF.js） |
| dexie | latest | IndexedDB 封裝，儲存 PDF 檔案與素材 |
| react-signature-canvas | latest | 簽名繪製 |
| tailwindcss | 內建 | CSS 框架 |
| shadcn/ui | latest | UI 元件庫（Button, Dialog, Input, Select, Card 等） |

### 第三方整合
- 無（全離線運作，不需 API 後端）

---

## 3. 功能規格

### 3.1 儀表板 (`/`)
- 顯示已上傳的 PDF 列表（卡片或列表檢視）
- 顯示預設範本列表（內建範例表單）
- 「上傳 PDF」按鈕（支援點擊與拖曳）
- 點擊任一 PDF → 導航至 `/fill/[id]`

### 3.2 PDF 填寫 (`/fill/[id]`)
- **左側** — PDF 預覽（react-pdf 渲染）
  - 分頁導覽（上一頁/下一頁/跳頁）
  - 縮放控制
- **右側面板** — 自動產生的表單欄位列表
  - 欄位名稱作為標籤
  - 依據欄位型別渲染對應輸入元件：
    - `TextField` → `<Input>`
    - `CheckBox` → `<Checkbox>`
    - `RadioButton` → `<RadioGroup>`
    - `Dropdown` → `<Select>`
  - 必填欄位標記
- **素材庫面板**（可開關的側邊欄）
  - 顯示已儲存的個人資料素材
  - 點擊素材 → 自動比對欄位名稱並填入
- **簽名工具**
  - 繪製簽名（可調整畫筆粗細、清除重畫）
  - 可儲存至素材庫
  - 可從素材庫選取既有簽名
- **匯出按鈕**
  - 將目前填寫內容寫入 PDF 並觸發下載

### 3.3 素材管理 (`/materials`)
- 列表顯示所有已儲存素材，分兩類：
  - **個人資料** — 名稱、電話、地址、統編、Email 等
  - **簽名** — 已儲存的簽名圖片
- 新增個人資料素材（表單輸入）
- 編輯、刪除既有素材

### 3.4 預設範本
- 內建 2-3 個測試用範例 PDF（含 AcroForm 欄位）
- 存放於 `public/templates/`
- 首次造訪時可選用

---

## 4. 資料庫設計 (Dexie.js / IndexedDB)

### 4.1 `pdfs` 表

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | `number` | Primary key (autoIncrement) |
| `name` | `string` | 檔案名稱 |
| `fileData` | `Blob` | PDF 原始檔案內容 |
| `uploadedAt` | `Date` | 上傳時間 |
| `type` | `'upload' \| 'preset'` | 來源 |

### 4.2 `materials` 表

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | `number` | Primary key (autoIncrement) |
| `name` | `string` | 素材名稱（如「我的資料」） |
| `type` | `'personal_info' \| 'signature'` | 分類 |
| `data` | `PersonalInfo \| SignatureData` | JSON 內容 |
| `createdAt` | `Date` | 建立時間 |

### 4.3 TypeScript 型別

```typescript
interface PersonalInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  [key: string]: string; // 自訂延伸欄位
}

interface SignatureData {
  dataUrl: string; // base64 PNG
}

interface PDFField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown';
  required: boolean;
  options?: string[]; // radio / dropdown 的選項
  value?: string | boolean;
}

interface PDFDocument {
  id?: number;
  name: string;
  fileData: Blob;
  uploadedAt: Date;
  type: 'upload' | 'preset';
}
```

---

## 5. Component 架構

```
src/
├── app/
│   ├── layout.tsx            # Root layout (shadcn provider)
│   ├── page.tsx              # 儀表板
│   ├── fill/
│   │   └── [id]/
│   │       └── page.tsx      # PDF 填寫頁
│   └── materials/
│       └── page.tsx          # 素材管理頁
├── components/
│   ├── PDFUploader.tsx       # 上傳區域 (drag & drop)
│   ├── PDFViewer.tsx         # react-pdf 封裝
│   ├── FormFieldPanel.tsx    # 欄位列表 + 輸入面板
│   ├── FieldRenderer.tsx     # 單一欄位輸入（依類型分派）
│   ├── MaterialPanel.tsx     # 素材庫側邊欄 (drawer)
│   ├── MaterialCard.tsx      # 單一素材卡片
│   ├── PersonalInfoForm.tsx  # 編輯個人資料素材表單
│   ├── SignaturePad.tsx      # 簽名繪製
│   ├── SignaturePadDialog.tsx# 簽名繪製對話框
│   ├── PresetTemplates.tsx   # 預設範本選擇區域
│   ├── DashboardCard.tsx     # 儀表板中的 PDF 卡片
│   └── ExportButton.tsx      # 匯出按鈕
└── lib/
    ├── db.ts                 # Dexie 資料庫初始化
    ├── types.ts              # 共用型別
    ├── pdfUtils.ts           # pdf-lib 操作封裝
    │   ├── detectFormFields(blob) → PDFField[]
    │   └── fillAndExport(blob, values) → Blob
    └── materialStore.ts      # 素材 CRUD 操作
```

---

## 6. 資料流

```
上傳/選擇 PDF
    │
    ▼
儲存 Blob 至 IndexedDB (db.pdfs)
    │
    ▼
pdf-lib 讀取 Blob → 解析 AcroForm → 回傳 PDFField[]
    │
    ▼
React state: { [fieldName]: value }
    │
    ▼
FormFieldPanel + FieldRenderer 產生 UI
    │        ▲
    │        └── MaterialPanel 點擊素材 → 自動填入
    │
    ▼
填寫完成 → 點擊「匯出」
    │
    ▼
pdf-lib: 將 values 寫入 PDF → 產出新 Blob
    │
    ▼
URL.createObjectURL → <a download> 觸發下載
```

### 素材填入比對邏輯
當使用者在填寫頁點擊素材時，系統會根據欄位名稱關鍵字比對：

```
素材欄位: { name: "王小明", phone: "0912345678", email: "test@test.com" }
PDF 欄位: { "full_name": TextField, "phone_number": TextField, "email_address": TextField }

比對方式: 將 PDF 欄位名稱轉小寫，移除底線/空白，與素材 key 進行 fuzzy match
```
> 備註：第一版實作採用 exact match 即可（欄位名稱欄位全部轉小寫後比對關鍵字）。

---

## 7. 關鍵技術注意事項

1. **Client Components Only** — 所有包含 PDF 操作或 IndexedDB 存取的元件必須標註 `'use client'`，且 dynamic import 需設 `{ ssr: false }`
2. **pdf-lib 座標** — PDF 座標系統以左下角為原點 (0,0)，單位為 point (1pt = 1/72 inch)。react-pdf 渲染的 CSS 座標需要換算才能疊加 UI
3. **PDF 尺寸限制** — 實務上單檔建議不超過 20MB，IndexedDB 一般沒有限制但瀏覽器儲存配額因瀏覽器而異
4. **簽名圖片** — 儲存為 base64 PNG data URL，匯出時 pdf-lib 使用 `embedPNG()` 嵌入
5. **AcroForm 唯讀欄位** — pdf-lib 可讀取 readonly flag，此類欄位不產生輸入 UI

---

## 8. 實作順序

| 步驟 | 內容 | 依賴 |
|------|------|------|
| 1 | 初始化專案、安裝依賴、設定 shadcn/ui | - |
| 2 | lib/types.ts, lib/db.ts（Dexie schema 定義） | 步驟 1 |
| 3 | lib/pdfUtils.ts（pdf-lib 封裝） | 步驟 2 |
| 4 | lib/materialStore.ts（素材 CRUD） | 步驟 2 |
| 5 | 儀表板 `/` + PDFUploader + PresetTemplates | 步驟 2 |
| 6 | PDF 填寫頁 `/fill/[id]` + PDFViewer + FormFieldPanel | 步驟 3 |
| 7 | MaterialPanel + SignaturePad 整合 | 步驟 4, 6 |
| 8 | ExportButton + 匯出流程 | 步驟 3, 6 |
| 9 | 素材管理頁 `/materials` | 步驟 4 |
| 10 | 預設範本 PDF 製作、最終測試 | 步驟 5 |

---

## 9. 非功能性需求

- **離線可用** — 所有功能無需網路（除了首次載入頁面）
- **無後端** — 所有資料僅存於使用者瀏覽器，不上傳任何伺服器
- **響應式** — 支援桌面與平板（填寫頁雙欄佈局於手機可改單欄）
- **無需帳號** — 避免認證流程，即開即用

---

## 10. 未來可擴充方向（非 V1 範圍）

- 自定義欄位模板（手動在 PDF 上框選欄位位置）
- 資料備份/還原（匯出 IndexedDB 內容）
- WebUSB 支援實體簽名板
- 表單進度儲存（自動存 draft）
