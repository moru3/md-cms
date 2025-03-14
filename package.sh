#!/bin/bash
# package.sh - md-cms のパッケージ処理スクリプト
# 注意: このスクリプトを実行する前に、chmod +x package.sh を実行して実行権限を付与してください。

echo "既存の dist/target フォルダを削除中..."
rm -rf dist
rm -rf target

echo "TypeScript をビルド中..."
npm run build

echo "pkg を使用して各OS向けのバイナリを生成中..."
npx pkg . --targets node18-macos,node18-linux,node18-win --no-cache --out-path target

echo "パッケージ処理が完了しました。"
