import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind'; 
import sitemap from "@astrojs/sitemap";

// ----------------------------------------------------------------------
// 架构思维：单一配置文件，根据环境变量动态调整配置
// ----------------------------------------------------------------------

// 关键步骤：读取由 package.json 脚本加载的环境变量。
// 如果未设置，则回退到安全默认值 (开发环境配置)。
const SITE = process.env.PUBLIC_SITE || 'http://localhost:4321/';
const BASE = process.env.PUBLIC_BASE || '/';

console.log(`[Astro Config] Using SITE: ${SITE}`);
console.log(`[Astro Config] Using BASE: ${BASE}`);

export default defineConfig({
  // 根据环境变量动态设置 site 和 base
  site: SITE,
  base: BASE,
  
  integrations: [
    sitemap(),
    react({
      // 允许 Astro 处理 .tsx 文件作为组件
      include: ['**/*.tsx', '**/*.jsx'],
    }),
    // 使用 Astro 官方 Tailwind 集成 (v3)
    tailwind(),
  ],
  
  // 启用 Strict 模式的 TypeScript
  typescript: 'strict',
  
  // 服务器配置 (主要用于 dev 和 preview)
  server: {
    host: true,
    port: 4321,
    // 允许的主机列表应包含开发和生产环境
    allowedHosts: [
      'dev.myastro.com',
      '192.168.5.5',
      'localhost',
      '127.0.0.1',
      'aviciiedulab.dpdns.org', // 生产域名也应允许
    ],
  },

  // 动态设置输出目录，以防开发构建和生产构建冲突
  outDir: SITE.includes('localhost') ? 'dist-dev' : 'dist',
});