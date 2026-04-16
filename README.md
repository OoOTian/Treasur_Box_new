# 工具箱（Vue 3 + Vite）

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 部署到 GitHub Pages

已内置 GitHub Actions 工作流，推送到 `main` 分支会自动构建并发布到 Pages。

1. 将项目推到 GitHub 仓库（默认分支 `main`）。
2. 在 GitHub 仓库 Settings → Pages：
   - Build and deployment 选择 `GitHub Actions`。
3. 等待 Actions 里的 `Deploy to GitHub Pages` 工作流跑完。
4. 访问 `https://<username>.github.io/<repo>/`。

说明：部署到 Pages 时会自动设置 Vite 的 `base` 为 `/<repo>/`，并在该环境下使用 Hash 路由以避免刷新 404。
