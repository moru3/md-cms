# md-cms

md-cms は、マークダウン形式の記事を管理・配信するための簡易 CMS システムです。各記事はプロジェクトルート直下の ID 名のディレクトリとして配置され、その中の固定ファイル `index.md` に記事本文および frontmatter（メタデータ）が記述されます。画像は各記事ディレクトリ内の `images` フォルダに保存され、API 経由でアクセスすることが可能です。

## 特徴

- **記事管理**: 各記事はディレクトリ単位で管理し、`index.md` 内の frontmatter により記事情報（id、title、created_at、categories、tags、author など）を制御します。
- **API エンドポイント**:
  - `/posts`: 全記事または指定した記事（クエリパラメータ id）を取得
  - `/categories`: 全ての記事から一意のカテゴリリストを取得
  - `/images`: クエリパラメータ `id` により画像ファイルを取得
  - カスタムエンドポイント: frontmatter に記述された予約語以外のキーに応じて、動的にエンドポイントを自動生成し、そのキーに該当する値を JSON として返します。
- **画像パス**: 記事内の images フォルダの画像は、環境変数 `BASE_URL`（またはデフォルトで `http://localhost:11920`）をもとに、フルパスで返されるように設計されています。

## ディレクトリ構造

各記事は以下のように配置します：

```
/article1
  ├── index.md      # Markdown 形式の記事ファイル（frontmatter を含む）
  └── images/
       ├── image1.jpg
       └── image2.png
/article2
  ├── index.md
  └── images/
       └── ...
```

## 実行方法

シングルバイナリにパッケージ化することで、各プラットフォーム向けに実行可能なファイルを生成します。  
プロジェクトルートで以下のコマンドを実行してください：

```bash
chmod +x package.sh
./package.sh
```

このスクリプトは、以下の処理を行います：
1. TypeScript のビルド (`npm run build`)
2. `pkg` を使用して各OS向けのバイナリを `target/` ディレクトリに出力  
   - 例: `md-cms-macos`, `md-cms-linux`, `md-cms-win.exe`

また、`node index.js` を実行することで、開発環境用のサーバを起動できます。サーバはデフォルトでポート `11920` で動作します。

## API 仕様例

- **GET /posts?id=article1**  
  指定された記事 ID の記事データを JSON 形式で返します。

- **GET /categories**  
  全記事の frontmatter から一意のカテゴリ一覧を抽出して返します。

- **GET /images?id=article1/images/image1.jpg**  
  画像ファイルを返します。

- **カスタムエンドポイント**  
  例えば、記事の frontmatter 内に `hoge: ["value1", "value2"]` と記述があれば、 `/hoge` エンドポイントで `["value1", "value2"]` を返します。

## GitHub Actions を利用した CI/CD

- [CI ワークフロー](.github/workflows/ci.yml) は、プッシュやプルリクエスト時にテスト実行とパッケージ生成を自動で行います。
- [Release ワークフロー](.github/workflows/release.yml) は、タグをプッシュすることで GitHub Releases に各プラットフォーム向けのバイナリをアップロードします。

## テスト

ユニットテストは `jest` および `ts-jest` を利用して実装されています。  
テストの実行方法:

```bash
npx jest
```

## 注意事項

- 記事フォルダはプロジェクトルート直下に配置することを想定しています。  
- 必要に応じて、環境変数 `BASE_URL` を設定し、画像パスにフルパスを含めるように変更可能です。

## License

ISC
