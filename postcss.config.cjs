// postcss.config.cjs

module.exports = {
  plugins: {
    // 确保 Tailwind CSS 在 PostCSS 流程中运行
    tailwindcss: {},
    
    // Autoprefixer 负责添加浏览器前缀，提高兼容性
    autoprefixer: {},
  },
};