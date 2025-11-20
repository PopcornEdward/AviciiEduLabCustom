// tailwind.config.cjs - 最终修复版：通过自定义插件强制 Grid 拉伸

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}',
  ],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... (保持您的其他颜色配置)
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    
    // 🎯 核心修复插件：注入一个强制 Grid/Flex 子元素垂直拉伸的样式
    function ({ addUtilities }) {
      addUtilities({
        // 这是一个 Hack，用于修复某些 Grid/Flex 父元素下，子元素 h-full 继承失败的问题
        '.force-grid-stretch > *': {
          'height': '100% !important',
        },
      }, ['responsive']);
    },
  ],
};