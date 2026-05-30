# XMind Convert

把现代 `.xmind` 文件在浏览器本地转换为 Markdown。

在线访问：[https://ouerzc.github.io/xmind-convert/](https://ouerzc.github.io/xmind-convert/)

## 本地开发

```bash
npm install
npm run dev
```

## 验证

```bash
npm run test
npm run typecheck
npm run build
```

## 部署到 GitHub Pages

仓库已经包含 GitHub Pages workflow：`.github/workflows/deploy.yml`。

1. 在 GitHub 创建仓库并推送代码，默认分支使用 `main`。
2. 进入仓库 `Settings -> Pages`。
3. 在 `Build and deployment` 的 `Source` 中选择 `GitHub Actions`。
4. 推送到 `main`，或在 `Actions` 页面手动运行 `Deploy GitHub Pages`。

构建时会根据 `GITHUB_REPOSITORY` 自动设置 Vite `base`：

- `https://<user>.github.io/<repo>/`：自动使用 `/<repo>/`。
- `https://<user>.github.io/` 或自定义域名：自动使用 `/`。

如果需要覆盖路径，可以在 workflow 或本地命令中设置 `VITE_BASE_PATH`。
