# Dater2

## 概要

Dater2 は、Google カレンダーの予定情報をもとに、
「月ごとの空き状況」と「日ごとの時間帯の空き状況」を表示する Google Apps Script（GAS）製の Web アプリです。

URL のクエリパラメータ `calendarId` で対象カレンダーを切り替えて利用します。

## 主な機能

- 月カレンダー表示（`index` ページ）
  - 日ごとに「空き（ok）」または「予定あり（ng）」を色分け表示
  - 各日をクリックすると日別の時間帯一覧へ遷移
- 日別タイムテーブル表示（`list` ページ）
  - 0:00〜24:00 を 1 時間単位で「〇 / ×」表示
  - 前日 / 翌日へ移動
- カレンダーアクセス不可時のエラーページ表示（`error` ページ）

## 動作仕様（実装ベース）

- 判定対象は Google カレンダーの終日を含む全イベント
- 時間帯判定は 1 時間スロットとの重なりで判定
　- スロットに少しでも重なれば `ng`（予定あり）
- URL パラメータ
　- `calendarId`: 対象の Google カレンダー ID（必須）
　- `page`: `index` または `list`（省略時は `index`）
　- `year`, `month`, `day`: 表示年月日（`list` で使用）

## 必要環境

- Google アカウント
- Google Apps Script
- Node.js（ローカルから管理する場合）
- `@google/clasp`（任意、ローカル開発時）

## セットアップ

### 1. 依存関係をインストール（任意）

ローカルで編集・push する場合のみ実行します。

```bash
npm install
```

### 2. Apps Script プロジェクトを用意

- Apps Script で新規プロジェクトを作成
- `main.js`, `index.html`, `list.html`, `error.html`, `appsscript.json` を配置
- （`clasp` を使う場合）`clasp login` → `clasp push`

### 3. Web アプリとしてデプロイ

- Apps Script エディタで「デプロイ」→「新しいデプロイ」→「ウェブアプリ」
- 実行ユーザー・アクセス権を用途に応じて設定

※ 現在の `appsscript.json` は以下設定です。

- `executeAs: USER_DEPLOYING`
- `access: MYSELF`

このままだとデプロイ者本人のみアクセス可能です。共有利用する場合はデプロイ設定の見直しが必要です。

## Google カレンダー ID の取得方法

1. Google カレンダーを開く
2. 左の「マイカレンダー」または「他のカレンダー」から対象カレンダーを選択
3. 「設定と共有」→「カレンダーの統合」へ進む
4. 「カレンダー ID」をコピー

## 使い方

デプロイURLに `calendarId` を付与してアクセスします。

```text
https://script.google.com/macros/s/XXXXXXXXXXXX/exec?calendarId=<カレンダーID>
```

### URL例

- 月表示（初期表示）
　- `.../exec?calendarId=<ID>`
- 月表示（年月指定）
　- `.../exec?calendarId=<ID>&page=index&year=2026&month=3`
- 日表示
　- `.../exec?calendarId=<ID>&page=list&year=2026&month=3&day=10`

## ファイル構成

- `main.js`: ルーティング、カレンダー取得、空き状況判定
- `index.html`: 月カレンダー表示
- `list.html`: 日別タイムテーブル表示
- `error.html`: エラーページ
- `appsscript.json`: GAS マニフェスト

## 注意事項

- カレンダー ID が誤っている、またはアクセス権がない場合はエラーページを表示します。
- タイムゾーンは `Asia/Tokyo` です。
- 表示結果は対象カレンダーの予定状況に依存します。