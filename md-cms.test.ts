import { promises as fs } from 'fs';
import path from 'path';
import { getArticle } from './md-cms';
import { marked } from 'marked';

describe('getArticle', () => {
  const testDir = path.join(process.cwd(), 'test_article');
  const indexPath = path.join(testDir, 'index.md');
  const sampleFrontmatter: Record<string, any> = {
    id: 'test-article',
    title: 'Test Article',
    created_at: '2025-03-14',
    categories: ['test'],
    tags: ['jest'],
    author: 'unittest'
  };
  const sampleMarkdown = 'This is a **test** article.';
  let sampleIndexContent = `---\n`;
  for (const key in sampleFrontmatter) {
    let value = sampleFrontmatter[key];
    if (Array.isArray(value)) {
      value = `[${value.join(', ')}]`;
    }
    sampleIndexContent += `${key}: ${value}\n`;
  }
  sampleIndexContent += `---\n\n${sampleMarkdown}`;

  beforeAll(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(indexPath, sampleIndexContent, 'utf8');
  });

  afterAll(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should read the article and parse frontmatter correctly', async () => {
    const article = await getArticle('test_article');
    expect(article.id).toBe(sampleFrontmatter.id);
    expect(article.title).toBe(sampleFrontmatter.title);
    expect(article.categories).toEqual(expect.arrayContaining(sampleFrontmatter.categories));
    expect(article.author).toBe(sampleFrontmatter.author);
    const expectedHtml = marked(sampleMarkdown) as string;
    const expectedHtmlBase64 = Buffer.from(expectedHtml).toString('base64');
    expect(article.body).toBe(expectedHtmlBase64);
  });
});
