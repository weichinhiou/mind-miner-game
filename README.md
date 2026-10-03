# 思想淘金記

依 `思想淘金記_PRD_v1.md`（v1.1）實作的單人瀏覽器 MVP。黑貓礦工在 60 秒內挖取金塊、寶石、石頭與思想藏書，收藏八位人物的視角。

## 本機啟動

需要 Node.js 22 以上，無第三方依賴，不需 npm install。

```powershell
cd D:\Git\Game\mind-miner
npm start
```

開啟 http://127.0.0.1:4173 。必須透過 HTTP 啟動，直接雙擊 HTML 不支援 ES modules 與人物 JSON 載入。伺服器僅監聽本機，不是正式部署服務。

```powershell
npm test
npm run check
```

## 功能與操作

- 首頁 → 3、2、1 → 60 秒挖礦 → 結算 → 收藏冊／再挖一局。
- 點擊遊戲區、空白鍵或「出鉤」按鈕發射。伸出與拉回中不排隊。
- 暫停、切到背景、視窗 resize 都會保留遊戲狀態，需按「繼續挖礦」。Escape 可暫停。
- 物品完整抵達支點才給分；時間到立即結算，未回收物品不入帳。
- 學者首次／重複發現立即寫入本機收藏。正常計時結束才更新最高分；提前結束仍保留已入帳收藏。
- 收藏詳情包含姓名卡、短介、視角摘要、反思問題與 PRD 提供的來源。
- 靜音與收藏保存在此瀏覽器。存檔損毀、未知 schema 或容量不足會顯示保存限制，仍可繼續玩；不默默覆蓋舊資料。

## 設定與檔案

| 位置 | 用途 |
|---|---|
| `src/config.js` | 時間、重量、分數、速度、出現數量、正式整合 URL |
| `src/engine.js` | 獨立遊戲狀態、線段碰撞、盤面生成、暫停、座標重映射 |
| `src/render.js` | 原創 Canvas 黑貓、物件、山景與土層繪製 |
| `src/storage.js` | `thought-miner:save` 命名空間及存檔容錯 |
| `src/app.js` | 頁面流程、唯一 RAF、DOM 操作、音效、收藏詳情 |
| `data/scholars.json` | PRD 第 15 節八位人物原始文字資料 |
| `tests/game.test.js` | 核心規則自動測試 |
| `docs/implementation.md` | 盤點、設計取捨、驗證與待補 |

`portalUrl`、`personaLensUrl` 預設 null。填入經確認的完整 http(s) URL 後才顯示入口。Persona Lens 暫只支援功能首頁，不假設人物 query 或路由。尚未整合正式任意門技術棧。

## 素材與內容

全部圖像由本專案程式繪製，音效由 Web Audio 合成，沒有外部圖片或字體載入。人物文字直接取自 PRD，未擅自重寫；方法摘要為編寫轉譯。人物來源連結可在收藏詳情查看。頭像仍以姓名卡替代。

待補正式任意門／Persona Lens URL、正式頭像與水彩美術。詳細限制及測試見 [實作紀錄](docs/implementation.md)。本資料夾原先只有 PRD，現已建立本機 Git；此版本未部署或 push。

## 版本與開發文件

目前版本為 `v0.1.0` 本機 MVP；後續建議先補驗收，再做正式入口整合與發布。

- [文件索引](docs/README.md)：所有專案文件入口。
- [版本規劃](docs/roadmap.md)：v0.2.0、v0.3.0、v1.0.0 範圍及完成門檻。
- [架構](docs/architecture.md)、[開發與驗收](docs/development.md)：模組、保存契約與 Git 流程。
- [變更紀錄](CHANGELOG.md)、[AI 交接](docs/AI_HANDOFF.md)：已交付內容與下一步。

Git 目前只有本機歷史，尚未設定 origin。程式與文件分開提交，整合於 main 並標記 v0.1.0。重新開工請先確認实际 Git 狀態。
