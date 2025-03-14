# 概要

プロジェクト名 : md-cms

markdown cmsシステム。
blogのstatic generation に利用するサーバを作成する。簡易cmsである。
保管庫の直下にフォルダを記事ごとに作成する。
そのフォルダ名が記事のidとなり、uriとなるようなイメージ。
記事自体はindex.md（名称固定）に記述し、メタデータはfrontmatterで記述する。（tags, title, date, authorなど）
画像はimagesフォルダに格納する。
obsidianやvscodeなどローカルでも記事を書いて、画像つきでプレビューできるような環境とする。
nextjsのstatic generationで利用する想定。
画像もこのサーバから取得し、static generationのhtmlと同時に取得保存する想定。なので、画像も本システムからダウンロードできる必要がある。

## 構造

```
/article1
    index.md
    /images
        image1.jpg
        image2.jpg
```

## index.md

サンプル。記事自体はこのように記述していく。

```markdown
---
id: 20230320-lambda-endpoint-url
title: AWS Lambdaの関数URLを利用した時間のかかるOpenAI APIの非同期化
created_at: "2023-03-20T18:00:00.000Z"
categories: ["開発", "AWS"]
---

## 動機

最近流行のChatGPT、最近GPT4が公開されてより一層流行の兆しをみせています。
GPT2のころは色々試していたのですが、重い腰をあげて最近公開されたOpenAIのAPIを利用する環境を作ろうと思いたちました。
その前段として、SlackのスラッシュコマンドからLambdaを叩いてOpenAI APIを叩く環境を作ろうとしました。


### Lambda関数URL

Lambdaで実装するにあたって、API呼び出しにはAPI Gatewayが必要なのかと覚悟していたのですが、知らぬ間にLambda単体でhttpsのエンドポイントを生やすことができるようになったようです。
機能は少なくシンプルなので用途にあった場合に利用を候補に入れるとよさそうです。

[Lambda 関数 URL](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/lambda-urls.html)

## 構成

以下の画像のような構成にしました。
1つ目の関数でリクエストを受け、必要な項目だけを2つ目の非同期実行Lambda関数に渡します。

![](./images/zentai.png)
```

## APIレスポンスサンプル

記事レスポンスサンプル

```json
{"id":"20230320-lambda-endpoint-url","title":"AWS Lambdaの関数URLを利用した時間のかかるOpenAI APIの非同期化","created_at":"2023-03-20T18:00:00.000Z","categories":["開発","AWS"], images: ["/images?id=20230320-lambda-endpoint-url/image1.jpg", "/images?id=20230320-lambda-endpoint-url/image2.jpg"], body:"記事本体をhtmlに変換しのbase64にしたもの"}
```

bodyはindex.mdをhtmlに変換し、base64にしたもの。

## 必要なAPI

- GET /posts
  - JSON-arrayで全ての記事を取得する
- GET /posts?id=xxxx
  - idで指定した記事を取得する
- GET /posts?categories=xxxx,yyyy
  - categoryで指定したカテゴリの記事を取得するカンマ区切りで複数指定可能
- GET /posts?hoge=xxxx,yyyy
    - カスタムタグで指定した記事を取得するカンマ区切りで複数指定可能
- GET /categories
    - JSON-arrayで全てのカテゴリを取得する（全ての記事のメタデータcategoriesを取得してuniqueにしたarrayを返す）
- GET /hoge
    - 指定された文字列のカスタムタグをフロントマターから探しuniqueにしたarrayを返す

## 必要なAPI（画像）

- GET /images?id=xxx
  - 記事レスポンスのimagesにあるキーを指定すると、画像を取得できる

## 開発環境

typescript、実行可能バイナリで提供する。

### 動作イメージ

以下を実行すると localhost に port 11920 でサーバが起動する。

```
sh md-cms
```

## 指示

方針や仕様を `.clinerules` をまず作ってください。
