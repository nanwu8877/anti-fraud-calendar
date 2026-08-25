# 反诈日历生成器

一个纯前端、打开即用的反诈宣传海报生成器。日期、农历、海报预览和 PNG 下载均在浏览器本地完成，不上传填写内容。

## 手动上传到 GitHub

1. 在 GitHub 新建一个仓库，建议命名为 `anti-fraud-calendar`。
2. 解压本项目，把本目录内的所有文件上传到仓库根目录并提交到 `main` 分支。
3. 打开仓库的 **Settings → Pages**。
4. 在 **Build and deployment → Source** 中选择 **GitHub Actions**。
5. 打开 **Actions**，等待 `Deploy static site to Pages` 变为绿色。
6. 部署地址通常为 `https://你的用户名.github.io/仓库名/`。

之后每次提交到 `main`，网站都会自动重新发布。

## 本地运行

需要 Node.js 22 及 pnpm：

```bash
pnpm install
pnpm run dev
```

生成静态文件：

```bash
pnpm run build
```

构建结果位于 `dist/`。

## 注意

- GitHub Pages 和 GitHub 的海外网络在中国大陆仍可能出现速度波动，不能保证稳定可达。
- 警徽、公安机关名称和相关宣传素材应在获得授权并完成内容审核后使用。
- 字体文件来自 LXGW WenKai 与 Noto Serif SC，许可证文本保存在 `public/fonts/`。

