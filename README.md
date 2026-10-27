# 思想淘金記

依 `思想淘金記_PRD_v1.md`（v1.1）實作的單人瀏覽器 MVP。黑貓礦工每輪有 60 秒挖取不同大小的金礦、銀礦、寶石與思想藏書，收藏八位人物的視角。寶物清空後可接續下一輪，每輪重新計時 60 秒並延續累積分數；廢鐵會扣分且很重，但不必挖完才能前進。

## 本機啟動

需要 Node.js 22 以上，無第三方依賴，不需 npm install。

```powershell
cd D:\Git\Game\mind-miner-game
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
- 小／大廢鐵分別扣 25／60 分，重量 5.5／9；拉回慢，碰到仍可選擇承受扣分。清空本輪金銀礦、寶石與藏書後，可略過廢鐵直接開始下一輪；新一輪重新計時 60 秒，分數與收藏進度延續。
- 學者首次／重複發現立即寫入本機收藏。正常計時結束才更新最高分；提前結束仍保留已入帳收藏。
- 收藏詳情包含人物頭像（缺图時用姓名卡）、短介、視角摘要、反思問題與 PRD 提供的來源。
- 靜音與收藏保存在此瀏覽器。存檔損毀、未知 schema 或容量不足會顯示保存限制，仍可繼續玩；不默默覆蓋舊資料。

每本藏書另帶回一句短句：每位人物 10 句，共 80 句。優先發現未見句子，全數解鎖後避免連續重複；遊戲中即時揭曉，結算及收藏詳情保留原文、語境及來源，並顯示教學／研究主題與編寫的應用提示。英文由本專案繁中編譯，非人物原始中文發言。

## 設定與檔案

| 位置 | 用途 |
|---|---|
| `src/config.js` | 時間、重量、分數、速度、各尺寸礦物數量、正式整合 URL |
| `src/engine.js` | 獨立遊戲狀態、線段碰撞、盤面生成、暫停、座標重映射 |
| `src/render.js` | Canvas 場景、黑貓、平台／絞盤／抓鉤及寶物素材繪製 |
| `src/storage.js` | `thought-miner:save` 命名空間及存檔容錯 |
| `src/app.js` | 頁面流程、唯一 RAF、DOM 操作、音效、收藏詳情 |
| `data/quotes.json`、`src/quotes.js` | 查核短句資料與未見優先輪替 |
| `data/scholars.json` | PRD 第 15 節八位人物原始文字資料 |
| `tests/game.test.js` | 核心規則自動測試 |
| `docs/implementation.md` | 盤點、設計取捨、驗證與待補 |

`portalUrl`、`personaLensUrl` 預設 null。填入經確認的完整 http(s) URL 後才顯示入口。Persona Lens 暫只支援功能首頁，不假設人物 query 或路由。尚未整合正式任意門技術棧。

## 素材與內容

遊戲場景、黑貓與採礦設備使用 Jean 提供的夕陽礦坑、吉祥物、操作平台、絞盤及三爪抓鉤；桌機與手機遊戲場景各有專用背景。素材載入失敗會回退程式繪圖；場景說明見 [素材說明](assets/scene/README.md)；六種金／銀礦、青藍水晶及紫色思想藏書圖見 [寶物素材說明](assets/treasures/README.md)。八位頭像使用 Jean 提供的參考圖，在本機素材中以 CSS 裁切顯示；音效由 Web Audio 合成，沒有外部圖片或字體網路載入。人物文字直接取自 PRD，未擅自重寫；方法摘要為編寫轉譯。人物來源連結可在收藏詳情查看。頭像來源與裁切設定見 [素材說明](assets/portraits/README.md)，載入失敗仍以姓名卡替代；網站 favicon 與社群分享圖見 [網站圖示素材](assets/branding/README.md)。

待補正式任意門／Persona Lens URL。詳細限制及測試見 [實作紀錄](docs/implementation.md)。

## 版本與開發文件

目前版本為 v0.2.20 MVP：結算列出各類正負向物件回收次數與本局帶回的學者藏書；礦坑物件及抓鉤載物位置已下移。正式網站：[思想淘金記遊戲](https://weichinhiou.github.io/mind-miner-game/)。

- [文件索引](docs/README.md)：所有專案文件入口。
- [版本規劃](docs/roadmap.md)：v0.2.x、v0.3.0、v1.0.0 範圍及完成門檻。
- [架構](docs/architecture.md)、[開發與驗收](docs/development.md)：模組、保存契約與 Git 流程。
- [變更紀錄](CHANGELOG.md)、[AI 交接](docs/AI_HANDOFF.md)：已交付內容與下一步。

GitHub：https://github.com/weichinhiou/mind-miner-game。main 追蹤 origin/main；v0.2.20 發布後建立 annotated tag。重新開工請先確認實際 Git 狀態。
