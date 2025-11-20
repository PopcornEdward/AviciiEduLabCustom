mkdir -p .github/workflows && cat <<EOF > .github/workflows/main.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ gh-pages ]  # 触发于push到gh-pages
  workflow_dispatch:  # 允许手动触发

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v5
      - name: Install, build, and upload your site
        uses: withastro/action@v5
        # with:
        #   path: .  # 项目根路径（可选，默认当前）
        #   node-version: 20  # Node版本（可选，根据你的项目调整）
        #   package-manager: npm  # 包管理器（可选，默认检测）

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
EOF