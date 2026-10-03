# 思想淘金記開發規範

開始工作前讀取 `D:\Git\AI-Agent\CORE_RULES.md`（若存在），遵守其中身份、SSOT 與跨專案協作規則。本檔補充專案技術規則。

## 文件入口

- 開工讀 [README](README.md) 與 [交接](docs/AI_HANDOFF.md)，確認目前版本、待辦及驗證限制。
- 修改玩法／內容讀 [PRD](思想淘金記_PRD_v1.md)，它是產品規格來源；版本提案見 [roadmap](docs/roadmap.md)，未完成的版本不能當成既有功能。
- 修改模組邊界、資料保存、載入或計時讀 [架構](docs/architecture.md)。複雜決策與測試結果更新 [實作紀錄](docs/implementation.md)。
- Commit、整合、版本標記前讀 [開發與驗收](docs/development.md)；完成後同步 CHANGELOG 與交接狀態。

## 技術邊界

- 沿用無依賴 ES modules、Canvas 遊戲與 DOM 介面。根目錄即 application root。
- `engine.js` 保持不依賴 DOM／瀏覽器，碰撞、計時、入帳等規則能用 Node 測試。
- 調整平衡集中於 `config.js`；人物內容由 `data/scholars.json` 管理，保留來源與編寫轉譯標示。
- 保存命名空間與人物 id 是相容性契約；修改前先規劃遷移，保留收藏。正式入口使用經確認的設定，缺少 URL 時隱藏。
- 回報完成時附實際驗證結果與未驗證項目。只有 Jean 明確授權才建立遠端、push 或部署。
