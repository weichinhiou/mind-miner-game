# 開發、Git 與版本驗收

## 本機開發

啟動與檢查命令以根目錄 [README](../README.md) 和 `package.json` 為準。純靜態 ES modules 沒有 bundler；修改後重新整理瀏覽器，JSON 需從 HTTP 載入。

## Git 工作流程

`main` 保存已驗證的本機基線。開工先確認 branch、HEAD、worktree、status、stash、近期 commit；有 origin 才 fetch 並比較。未設定 origin 時明確記錄「只有本機歷史」，不把本機 commit 當異地備份。

每個主題從最新 main 開自己的 `feat/`、`fix/` 或 `docs/` 分支。一個工作目錄只容納一個 session。看到非本任務變更或分支變動先釐清；保留別人的檔案。程式與文件使用分開的 commit／分支，程式先整合、文件後整合。

Commit 前重新確認基線分支，`git diff`／staged diff 只含本任務檔案；用明確路徑 stage。整合前檢查未解決衝突、完整搜尋衝突標記並確認與 main 差異；重大整合先建立 checkpoint tag。有 origin 時需重新 fetch，比對遠端差異。push main、部署與建立遠端仍需 Jean 明確授權。

## 驗收門檻

1. 遊戲規則或保存改動：`npm test` 與 `npm run check` 通過；補充能重現實際問題的測試。
2. UI／輸入／旋轉改動：桌機、手機尺寸實際操作，按 PRD 驗收表檢查相關流程，確認 console 問題。
3. 複雜決策、失敗結果、修正重測、未驗證項目寫入實作紀錄；版本完成項目寫 CHANGELOG，當前下一步寫 AI_HANDOFF。
4. 驗收與版本 metadata 一致才建立版本 tag；本機試玩版與正式發布需明確區分。

## 版本與回復

v0.1.0 為本機初版，尚未完整通過產品發布驗收。先重測，再更新 `package.json` 版本與 CHANGELOG，在包含程式及文件的 commit 上建立 annotated tag `vX.Y.Z`。要部署時另確認正式環境、入口及資料相容性，記錄部署驗證。

查閱舊版可用 `git show v0.1.0:src/engine.js`；需要舊版工作副本可在新分支／worktree 使用該 tag，保留現在工作目錄。已共享歷史的修正用 revert commit；不以 reset --hard 清掉工作。Git 只保存程式，不能回復瀏覽器收藏，因此保存格式遷移需另準備資料回復方案。

初建紀錄：2026-10-03，先於 `feat/initial-mvp` 保存程式，再建立 main 基線；`docs/project-foundation` 保存文件並以 fast-forward 整合。版本 tag 在文件整合後建立。未設定 origin，未 push／部署。

## 此機器的 Git 擁有者限制

2026-10-05 重試時確認，Codex sandbox 初始化曾把 `.git` 目錄擁有者設為 `LAPTOP-3UTNSAOB\CodexSandboxOffline`，sandbox 後續套用 deny ACL 失敗（`deny ACE failed ... open deny ACL target for update`），導致一般 command runner setup refresh 失敗。使用者核准 UAC 後只將 `.git` 目錄擁有者改為目前 Windows 使用者，沒有遞迴改動內部檔案；command runner 隨即恢復。Git 操作仍使用路徑限定的 `-c safe.directory=D:/Git/Game/mind-miner`，不寫入全域信任檔案。若再次出現，先檢查 sandbox log 與 `.git` owner；不要直接改用其他工作目錄或重建 repo。
