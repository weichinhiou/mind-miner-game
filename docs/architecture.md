# 架構與資料契約

日期：2026-10-05。對應 v0.2.7。

## 系統邊界

單一靜態瀏覽器遊戲，沒有後端、登入或雲端同步。`server.mjs` 只在本機提供靜態 HTTP 檔案。選擇與比較的理由見 [實作紀錄](implementation.md)，產品行為以 [PRD](../思想淘金記_PRD_v1.md) 為準。

| 模組 | 責任 | 邊界 |
|---|---|---|
| `config.js` | 共用玩法參數、整合 URL、邏輯尺寸 | 分數／重量調整的入口 |
| `engine.js` | Game 狀態、盤面生成、swept collision、單次入帳、resize | 不讀 DOM、不存檔、不播放音效；用 callback 通知入帳與結束 |
| `render.js` | Canvas 素材與場景繪製、DPR backing store | 讀取 Game，保持遊戲規則在 engine |
| `storage.js` | 本機資料驗證、收藏與最高分保存、失敗降級 | 瀏覽器 storage 由 app 注入，測試可用記憶體替代 |
| `app.js` | 頁面、RAF、輸入、暫停、音效、內容載入與 callback 組裝 | 唯一的瀏覽器整合層 |
| `scholars.json` | 人物資料、來源、編寫轉譯 | 人物 id 穩定；portrait 包含圖源與裁切座標，personaLensKey 仍為 null |

## 狀態與入帳

頁面：首頁、遊戲、結算、收藏冊及載入失敗。Game phase：`countdown` → `playing` ↔ `roundComplete` → `finished`；倒數／遊玩可暫停，`resumePhase` 保存恢復目標。`roundComplete` 凍結倒數，等待玩家選擇下一輪或結算。

鉤子：`swing` → `extending` → `returning`（載物）或 `empty`（抓空）→ `swing`。角度在發射時鎖定，線段碰撞取第一件。碰撞只把物件移到鉤子貨物；回支點才計分並觸發 onCollect。小／大廢鐵為 `collectible:false`，分數 −25／−60、重量 5.5／9；它們仍可抓取及回收，但不計入過關條件。本輪最後一件可收集物完整回收後進入 `roundComplete`，玩家開始下一輪時保留分數與剩餘時間，回合數加一、鉤子重置、盤面重新生成；未挖廢鐵隨盤面捨棄。遊戲仍以原 60 秒倒數結束。

更新先扣有效經過時間並判定到期，再處理鉤子；到期不入帳。app 使用單一 RAF 與時間差，暫停／恢復／resize 清除舊時間基準。切頁及失焦自動暫停，需使用者繼續。

結算 callback 更新正常完整回合最高分；提前結束只呈現成績。收藏每次入帳立即保存，所以未結束回合仍可保留已回收人物。

## 存檔契約

Key：`thought-miner:save`，schemaVersion：1。

```json
{
  "schemaVersion": 1,
  "bestScore": 0,
  "mute": false,
  "collection": {
    "feynman": { "firstUnlockedAt": "2026-10-03T13:00:00.000Z", "count": 1 }
  }
}
```

此為資料格式範例。收藏以 id 去重，首次日期固定、次數累加。不保存進行中回合。未知 schema／損毀資料保留原字串，本次改用記憶體且顯示限制；寫入失败亦降級。

修改 key、schema 或人物 id 前需定義遷移與回復測試。應用版本、存檔版本、人物 contentVersion 是三個獨立契約。瀏覽器不同 origin 有不同 localStorage；之後改網域／port 不會自動搬移收藏，發布時必須明確說明。

## 後續整合

URL 只接受已確認的 http(s) 設定，未配置時入口隱藏。Persona Lens 目前連功能首頁，人物映射尚未啟用。`portrait` 包含 src、sheetWidth、sheetHeight、crop（x、y、size）。DOM 以圓形容器裁切原圖；首頁已收藏預覽、結算卡、收藏冊與詳情共用顯示函式。image error 時移除失敗圖片並保留姓名卡；未解鎖及礦坑藏書保持剪影／通用封面。

物件數量已有 config 欄位，但生成順序及 fallback 位置仍在 engine；新增物件類型／改數量需要同步生成與繪製並更新測試，不能只改 count 即宣稱完整支援。極端隨機序列無法以 120 次嘗試排完時，fallback 依 5×3 固定格位配置 15 件，桌機／手機生成測試會檢查物件不重疊及首本藏書可達。

## 名句發現（v0.2.0）

`data/quotes.json` 保存穩定 id、scholarId、繁中文字、original、kind、sourceTitle、sourceUrl、context；`quotes.js` 純函式先選未見句子，耗盡後排除 lastQuoteId。藏書回支點時由 app 選句並與人物入帳一次保存。遊戲中提示不暫停計時，本局保存每次發現的句子；收藏詳情只揭露已發現句子。

schemaVersion 維持 1，每個人物收藏新增 `quoteIds: []` 與可選 `lastQuoteId`。舊存檔補空陣列，保留分數、靜音、次數與首次日期。已移除的句子 id 不影響人物收藏，新句子自然進入未見池。失敗保存沿用記憶體降級。

## 教學研究導向句庫（v0.2.1）

每位人物 10 句、共 80 句，topic 為主題，application 為本遊戲編寫的教學／研究應用提示；提示與原始引句分開顯示。孔子也能展開語境。人物詳情將所有未見句子合成一條剩餘數量，避免擴充後堆滿重複占位。

退役句子不重用 id；保留的 id 必須仍代表同一人物與同一原文。保存保留歷史 quoteIds，進度僅計當前有效池，因此退役項目不會誤解鎖新句。quote-history-v0.2.0.json 為已交付 id 的相容性快照。

## 場景、採礦設備與寶物素材（v0.2.2–v0.2.5）

render.loadSceneAssets 在內容啟動前載入本機圖片，成功存於渲染層，失敗允許程式繪圖。金／銀礦及藏書用透明主體裁切框正規化顯示，再按各尺寸碰撞半徑等比縮放。各物件分數、重量、半徑及每盤數量集中於 config.js 控制，盤面生成器依 count 建立。礦坑地表切線對齊既有邏輯y=200，兩區段縮放，不更改碰撞、origin或物品座標。背景金塊不參與碰撞；活物件亮框與半透明背板、鉤繩對比由render管理；地下遮罩 alpha 為 a8 以兼顧辨識與氣氛。場景來源見 assets/scene/README.md，寶物見 assets/treasures/README.md。server 必須先讀檔再寫200 header，以免缺圖404觸發重複寫header造成程序退出。

v0.2.10 起，直式 Canvas（width < height）優先使用 1024×1536 手機專用礦坑場景，整張繪製至 480×720 邏輯畫布；桌機持續使用原 1672×941 橫圖並依地表分段對齊 y=200。兩套素材只影響裝飾背景，不影響設備定位、目標座標或碰撞。
render.loadSceneAssets 在內容啟動前載入本機圖片，成功存於渲染層，失敗允許程式繪圖。金／銀礦及藏書用透明主體裁切框正規化顯示，再按各尺寸碰撞半徑等比縮放。各物件分數、重量、半徑及每盤數量集中於 config.js 控制，盤面生成器依 count 建立。礦坑地表切線對齊既有邏輯y=200，兩區段縮放，不更改碰撞或物品座標。背景金塊不參與碰撞；活物件亮框與半透明背板、鉤繩對比由render管理；地下遮罩 alpha 為 a8 以兼顧辨識與氣氛。場景來源見 assets/scene/README.md，寶物見 assets/treasures/README.md。server 必須先讀檔再寫200 header，以免缺圖404觸發重複寫header造成程序退出。

v0.2.4 將平台、絞盤與三爪抓鉤作為一組設備素材。config.equipmentLayout(size) 是渲染與引擎共用的唯一定位來源：桌面與直向尺寸會等比縮放平台與絞盤，平台頂面與絞盤底座落在同一高度，winch cable outlet、Game.origin 三者垂直對齊。resize 依新舊 origin 將盤面、鉤尖及貨物座標映射至新畫布。render 以素材透明邊界裁切留白；鋼索從 outlet 連至 game.point，抓鉤 connector 對齊物理鉤尖並以目前 angle 旋轉。

v0.2.5 明確固定 Canvas Z-order：背景 → 平台／角色／絞盤 → 地下目標與載物 → 鋼索 → 抓鉤。待機時也不再重畫平台前板覆蓋短鋼索或抓鉤，使線與鉤在所有狀態維持可見前景。此為純繪製順序調整，不改 Game 狀態、origin、angle、碰撞尺寸、玩法或入帳。

圖片尺寸／旋轉只控制視覺，CONFIG.hookRadius 仍為 7，礦物與書本 hitbox、角度、射出速度、重量回收速度、分數與入帳流程皆未調整。場景組裝參考圖不是 production asset，也未複製進專案。素材檔名與透明通道檢查記於 assets/scene/README.md。
