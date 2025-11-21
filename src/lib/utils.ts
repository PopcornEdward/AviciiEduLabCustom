// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化 Date 对象为路径字符串，格式为 YYYY/MM/DD。
 * * @param date - 输入的 Date 对象。
 * @returns 格式化后的路径字符串 (e.g., "2025/11/21")。
 */
export function formatDatePath(date: Date): string {
    const d = new Date(date);
    const year: number = d.getFullYear();
    // getMonth() 返回 0-11，所以需要 +1
    const month: string = String(d.getMonth() + 1).padStart(2, '0');
    const day: string = String(d.getDate()).padStart(2, '0');
    
    return `${year}/${month}/${day}`;
}

/**
 * 将字符串转换为 SEO 友好的 slug。
 * * @param text - 输入文本。
 * @returns slug 字符串。
 */
export function toSlug(text: string): string {
    // 移除所有非中英文、数字、空格和连字符的符号
    const cleanedText: string = text
        .toLowerCase()
        // 使用 'u' 标志支持 Unicode (中文)
        .replace(/[^\p{L}\p{N}\s-]/gu, '') 
        .trim();
    
    // 将空格替换为连字符
    return cleanedText.replace(/\s+/g, '-'); 
}