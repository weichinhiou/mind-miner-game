# 架構與資料契約

日期：2026-10-03。對應 v0.1.1。

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

頁面：首頁、遊戲、結算、收藏冊及載入失敗。Game phase：`countdown` → `playing` → `finished`；倒數／遊玩可暫停，`resumePhase` 保存恢復目標。

鉤子：`swing` → `extending` → `returning`（載物）或 `empty`（抓空）→ `swing`。角度在發射時鎖定，線段碰撞取第一件。碰撞只把物件移到鉤子貨物；回支點才計分並觸發 onCollect。

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

物件數量已有 config 欄位，但生成順序及 fallback 位置仍在 engine；新增物件類型／改數量需要同步生成與繪製並更新測試，不能只改 count 即宣稱完整支援。
