### US-003：實作素材 CRUD 儲存層

**作為** 開發者
**我想要** 封裝 `materials` 表的 CRUD 操作
**以便** 素材管理頁與填寫頁的素材面板可以統一透過 `materialStore` 存取

**輸入格式**：
- `lib/db.ts` 中的 `db` 實例
- `lib/types.ts` 中的 `PersonalInfo`、`SignatureData` 型別

**輸出格式**：
- `src/lib/materialStore.ts`，匯出以下 async functions：
  - `getMaterials(type?: 'personal_info' | 'signature'): Promise<Material[]>` — 取得素材列表
  - `getMaterial(id: number): Promise<Material | undefined>` — 取得單筆素材
  - `addMaterial(data: { name: string; type: 'personal_info' | 'signature'; data: PersonalInfo | SignatureData }): Promise<number>` — 新增素材
  - `updateMaterial(id: number, data: Partial<Material>): Promise<void>` — 更新素材
  - `deleteMaterial(id: number): Promise<void>` — 刪除素材

**驗收條件**：
- [ ] `getMaterials` 可依 type 篩選（不傳 type 回傳全部）
- [ ] `addMaterial` 成功後回傳新 id
- [ ] `updateMaterial` 只更新傳入的欄位，不影響其他欄位
- [ ] `deleteMaterial` 成功刪除指定 id 的資料
- [ ] `npx tsc --noEmit` 無錯誤

**依賴關係**：
- US-001（需 IDB schema 與型別）

**優先級**：P0
**相關功能**：素材管理（spec §3.3, §4.2）
