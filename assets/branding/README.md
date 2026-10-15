# 網站分享與圖示素材

## Favicon 套件

| 檔案 | 用途 | 尺寸／格式 |
|---|---|---:|
| favicon.ico | 瀏覽器與舊版客戶端預設圖示 | ICO，16、32、48、64 px 多尺寸 |
| favicon.png | 標準方形 PNG 圖示 | 512×512 |
| favicon-transparent.ico | 透明背景多尺寸 ICO | ICO，16、32、48、64 px |
| favicon-transparent.png | 透明背景 PNG | 512×512 RGBA |
| apple-touch-icon.png | iOS 主畫面圖示 | 180×180 |
| favicon-source.png | Jean 提供的原始方形淘金貓圖 | 1254×1254，原圖保留 |
| og-image.png | Open Graph／Twitter 分享預覽 | 1672×941 |

原始方形圖片保留於 favicon-source.png。各尺寸圖示由原圖產生；透明版本只移除金色圓角外框之外、與畫布邊界相連的近黑色區域，保留框內暗色背景。分享圖維持原始 PNG，不裁切、不轉檔。

index.html 使用帶版本 query 的根目錄 favicon.ico 與 PNG，避免舊圖示快取；Pages workflow 將四種 favicon、iOS 圖示複製到網站根目錄，並將 og-image.png 放在 assets/branding/。預覽伺服器允許並回應 ICO。