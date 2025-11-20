// src/components/landing/assets/summer.js
import p5 from "@/images/5.jpeg"; // 导入不同的图片
import p6 from "@/images/6.jpeg";

export const summerProducts = {
  title: "☀️ 清凉一夏产品",
  data: [
    { url: "#_", title: "Modular Synth Box", subtitle: "Magnetic knobs, dual input", price: "$149", image: p5 },
    { url: "#_", title: "Compact Action Camera", subtitle: "Transparent shell, neon ring", price: "$189", image: p6 },
    { url: "#_", title: "Sandals", subtitle: "Beach Ready", price: "$45", image: p6 }, // 示例：数量不用截取，由数据文件决定
  ]
};