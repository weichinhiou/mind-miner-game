# 名言來源與轉譯

查核日期：2026-10-03。初版共 24 句，八位人物各 3 句，資料位於 `data/quotes.json`。

## 收錄規則

英文短句由本專案自行翻成繁體中文，`kind: translation` 表示原文翻譯（original-translation），不是人物曾說過的中文。孔子保留古典原文，標 `kind: original`。部分短句為原段落中截取的完整子句或核心片段，具體位置與上下文寫在 `context`；沒有將後人編寫的反思文案稱作名言。

Feynman 黑板文字、Popper 書名、官方機構整理與校方當時的演講報導，分別按其證據種類註明；不宣稱所有來源都是親筆手稿。現代英語作品單一來源頁的原文總摘錄不超過 25 詞。

## 各人物證據

### feynman

- [The Feynman Lectures on Physics, Vol. I, Ch. 1](https://www.feynmanlectures.caltech.edu/I_01.html)
- [Richard Feynman 官方網站：Quotes](https://feynman.com/fun/quotes/)

- `feynman-01`：第 1-1 節：科學知識須接受實驗檢驗。
- `feynman-02`：第 1-1 節；緊接上一句，提醒不要以權威取代實驗。
- `feynman-03`：官網標明為逝世時留在黑板上的文字；不是演講逐字稿。

### deming

- [The W. Edwards Deming Institute：Where There is Fear You Do Not Get Honest Figures](https://deming.org/where-there-is-fear-you-do-not-get-honest-figures/)
- [The W. Edwards Deming Institute：Are You Learning or Just Staying Busy?](https://podcast.deming.org/are-you-learning-or-just-staying-busy)
- [The W. Edwards Deming Institute：A bad system will beat a good person every time](https://deming.org/quotes/a-bad-system-will-beat-a-good-person-every-time-3/)

- `deming-01`：管理十四點第 8 點標題；完整說明涉及讓每個人能有效工作。
- `deming-02`：研究所節目引述戴明；需有可檢驗的解釋，經驗才形成學習。
- `deming-03`：1993 年 2 月 Phoenix 四日研討會，Mike Stoecklein 的當時筆記，由 Deming Institute 查核收錄；提醒改善制度而非只責怪個人。

### popper

- [Karl Popper：The Importance of Critical Discussion，Free Inquiry, Winter 1981/82](https://centerforinquiry.s3.amazonaws.com/wp-content/uploads/sites/26/1981/01/22161304/p07.pdf)
- [Karl Popper：All Life is Problem Solving，Routledge 出版社](https://www.routledge.com/All-Life-is-Problem-Solving/Popper/p/book/9780203431900)

- `popper-01`：本文討論從錯誤學習的段落，從句子摘錄；此處是波普爾自己的論述，非前段引述伏爾泰。
- `popper-02`：文章結尾句內摘錄，主張以批判討論淘汰理論，避免淘汰提出理論的人。
- `popper-03`：著作書名與第 9 篇篇名；以書名短句呈現，並非另稱演講原句。

### munger

- [USC Gould School of Law：300 graduate from USC Law](https://gould.usc.edu/news/300-graduate-from-usc-law/)

- `munger-01`：2007 年 USC 法學院畢業致詞，校方當時報導的直接引述。
- `munger-02`：校方報導中的句內摘錄，完整上下文是比早上起床時更有智慧，鼓勵持續學習。
- `munger-03`：校方直接引述的條件句核心；上下文談練習跨領域思考。

### confucius

- [《論語·學而》1.1，中國哲學書電子化計劃](https://ctext.org/analects/xue-er)

- `confucius-01`：孔子言行由弟子及後學傳承；說讀作悅，指學習後反覆實踐的喜悅。
- `confucius-02`：《學而》首章，與朋友交流學習。
- `confucius-03`：《學而》首章，不因他人不了解自己而怨怒。

### osler

- [William Osler：A Way of Life，1913 原著](https://www.gutenberg.org/cache/epub/73116/pg73116-images.html)

- `osler-01`：第 I 節，以幼兒學走路說明反覆練習形成能力。
- `osler-02`：第 III 節句內摘錄，談專注當日生活的習慣。
- `osler-03`：第 IV 節句內摘錄，談耐心培養學習與工作的專注。

### nightingale

- [Florence Nightingale：Notes on Nursing，原著](https://www.gutenberg.org/cache/epub/12439/pg12439-images.html)

- `nightingale-01`：IV. Noise，句內摘錄；上下文談兼顧俐落與溫柔的照護動作。
- `nightingale-02`：IV. Noise，分號後完整子句。
- `nightingale-03`：XIII. Observation of the Sick，句內摘錄；觀察不是為了堆積雜亂的資料。

### drucker

- [The Drucker Institute：Quote Library](https://drucker.institute/quote-library/)

- `drucker-01`：官方名言庫 Strategy and Other Frequently Cited Lines；完整段落續談時間管理。
- `drucker-02`：官方列為精確原文的第二句，避免常見誤改的 efficiency/effectiveness 版本。
- `drucker-03`：官方名言庫 Strategy and Other Frequently Cited Lines。

## 誤傳與排除

- 戴明「沒有數據，你只是另一個有意見的人」未收錄。Deming Institute 明說未能認證此句，見[來源查核說明](https://deming.org/sourced-quotes-by-w-edwards-deming/)。
- 杜拉克「無法衡量就無法管理」未收錄；官方名言庫標示不是他的話。效率與有效性的句子按官方精確版本摘錄，不換成管理與領導的流行版本。
- 奧斯勒原著《A Way of Life》引用 Carlyle、Goethe、William James 等人的話；未將這些引用算為奧斯勒名言。本版只收錄他自己的敘述。
- 波普爾文章中有伏爾泰引文，本版沒有將該引文歸為波普爾。採用的可錯性片段位於他自己的下一頁論述。
- 蒙格「反過來想，總是反過來想」常是引用 Jacobi；本版採校方 2007 年畢業致詞直接引述，避開錯置原創。
- 南丁格爾本版採照護環境、動作與觀察的原著片段；未採用難追到原始文本的流行金句，也不將歷史護理內容當現代臨床指引。

## 驗證範圍

已閱讀上述網頁或原著文本中的支持段落，核对原句、人物 id、來源 URL 與上下文。英文標點和大小寫依摘錄位置保留，句內片段已明說。這是可追溯的首批短句，不是完整著作校勘或正式中文譯本。



