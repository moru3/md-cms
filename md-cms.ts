import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const app = express();
const PORT = 11920;
const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(express.json());
// Helper function to wrap async route handlers
function asyncHandler(fn: express.RequestHandler): express.RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 関数: 指定された記事IDの記事情報を取得
export async function getArticle(articleId: string) {
  const articleDir = path.join(process.cwd(), articleId);
  const indexPath = path.join(articleDir, 'index.md');
  try {
    const fileContent = await fs.readFile(indexPath, 'utf8');
    const { data, content: mdContent } = matter(fileContent);
    const html = marked(mdContent);
    const htmlBase64 = Buffer.from(html as string).toString('base64');

    // images ディレクトリから画像ファイル名を取得
    let images: string[] = [];
    const imagesDir = path.join(articleDir, 'images');
    try {
      const files = await fs.readdir(imagesDir);
      images = files.map(filename => `${baseUrl}/images?id=${articleId}/images/${filename}`);
    } catch (err) {
      // images ディレクトリが存在しない場合は無視
    }

    return {
      id: data.id || articleId,
      title: data.title || '',
      created_at: data.created_at || '',
      categories: data.categories || [],
      tags: data.tags || [],
      author: data.author || '',
      images,
      body: htmlBase64
    };
  } catch (err) {
    throw new Error(`Article ${articleId} not found.`);
  }
}

// GET /posts エンドポイント
app.get('/posts', asyncHandler(async (req, res) => {
  const { id, categories } = req.query;
  try {
    if (id) {
      const article = await getArticle(String(id));
      res.json(article);
      return;
    } else {
      const items = await fs.readdir(process.cwd(), { withFileTypes: true });
      const articles: any[] = [];
      for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('.')) {
          const indexPath = path.join(process.cwd(), item.name, 'index.md');
          try {
            await fs.access(indexPath);
            const article = await getArticle(item.name);
            articles.push(article);
          } catch (err) {
            // index.md が存在しなければスキップ
          }
        }
      }
      if (categories) {
        const cats = String(categories).split(',');
        res.json(articles.filter(article =>
          article.categories.some((cat: string) => cats.includes(cat))
        ));
        return;
      }
      res.json(articles);
      return;
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
}));

// GET /categories エンドポイント
app.get('/categories', asyncHandler(async (req, res) => {
  try {
    const items = await fs.readdir(process.cwd(), { withFileTypes: true });
    const categorySet = new Set<string>();
    for (const item of items) {
      if (item.isDirectory() && !item.name.startsWith('.')) {
        const indexPath = path.join(process.cwd(), item.name, 'index.md');
        try {
          await fs.access(indexPath);
          const article = await getArticle(item.name);
          (article.categories || []).forEach((cat: string) => categorySet.add(cat));
        } catch (err) {
          // 存在しなければ無視
        }
      }
    }
    res.json(Array.from(categorySet));
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
}));

// GET /images エンドポイント
// クエリパラメータ id には画像の相対パス（例: "20230320-lambda-endpoint-url/images/image1.jpg"）を指定
app.get('/images', asyncHandler(async (req, res) => {
  const { id } = req.query;
  if (!id) {
    res.status(400).send('Image id is required');
    return;
  }
  const imagePath = path.join(process.cwd(), String(id));
  try {
    res.sendFile(imagePath);
    return;
  } catch (err: any) {
    res.status(404).send('Image not found');
    return;
  }
}));

// 自動カスタムエンドポイント生成のための関数
async function updateCustomEndpoints(): Promise<{ [key: string]: any[] }> {
  const reservedKeys = new Set(["id", "title", "created_at", "categories", "tags", "author"]);
  const customEndpoints: { [key: string]: Set<any> } = {};
  const items = await fs.readdir(process.cwd(), { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory() && !item.name.startsWith('.')) {
      const indexPath = path.join(process.cwd(), item.name, 'index.md');
      try {
        await fs.access(indexPath);
        const fileContent = await fs.readFile(indexPath, 'utf8');
        const front = matter(fileContent).data;
        for (const key in front) {
          if (!reservedKeys.has(key)) {
            let value = front[key];
            if (Array.isArray(value)) {
              value.forEach(val => {
                if (!customEndpoints[key]) customEndpoints[key] = new Set();
                customEndpoints[key].add(val);
              });
            } else {
              if (!customEndpoints[key]) customEndpoints[key] = new Set();
              customEndpoints[key].add(value);
            }
          }
        }
      } catch (err) {
        // index.md が存在しない場合は無視
      }
    }
  }
  // Convert each Set to an Array
  const result: { [key: string]: any[] } = {};
  for (const key in customEndpoints) {
    result[key] = Array.from(customEndpoints[key]);
  }
  return result;
}

// 動的にカスタムエンドポイントを登録する
updateCustomEndpoints().then(customEndpoints => {
  // 既存の固定エンドポイントと衝突するものは除外
  const reservedEndpoints = ["posts", "categories", "images"];
  Object.keys(customEndpoints).forEach(key => {
    if (!reservedEndpoints.includes(key)) {
      app.get(`/${key}`, asyncHandler(async (req, res) => {
        res.json(customEndpoints[key]);
      }));
      console.log(`Custom endpoint '/${key}' registered with values:`, customEndpoints[key]);
    }
  });
}).catch(err => {
  console.error("Error updating custom endpoints:", err);
});

app.listen(PORT, () => {
  console.log(`md-cms server running on http://localhost:${PORT}`);
});
