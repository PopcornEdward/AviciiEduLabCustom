// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind'; 
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // 保持为你的自定义域名（Vercel用）
  site: 'https://aviciiedulab.dpdns.org/',
  
  // 关键修正：Vercel自定义域名下用根路径
  base: '/',
  
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
  
  server: {
    host: true,
    port: 4321,
    allowedHosts: [
      'dev.myastro.com',
      '192.168.5.5' 
    ],
  },
});