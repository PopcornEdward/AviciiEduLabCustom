// 这是一个 Node.js 脚本，用于自动化创建新的 Markdown 文章文件，支持命令行交互。
import * as fs from 'fs';
import * as path from 'path';
// 导入 readline 模块以实现命令行交互
import * as readline from 'readline';

// 配置 readline 接口，明确指定类型
const rl: readline.Interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

/**
 * 封装 readline.question 为 Promise，简化异步流程
 * @param query 要显示的提示信息
 * @returns 用户的输入
 */
function prompt(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}

// --- Helper Functions ---

/**
 * 将字符串转换为 SEO 友好的 slug。
 * 限制：只能包含中文、英文、数字、连字符。
 * @param text 
 * @returns slug
 */
function toSlug(text: string): string {
    // 首先移除所有标点符号、特殊符号和空格
    // \p{L} 匹配所有字母，\p{N} 匹配所有数字，使用 'u' 标志支持 Unicode (中文)
    const cleanedText: string = text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, '') 
        .trim();
    
    // 将空格替换为连字符
    return cleanedText.replace(/\s+/g, '-'); 
}

/**
 * 格式化日期对象
 * @param date 
 * @returns 包含日期字符串、路径字符串和时间戳的对象
 */
function formatDate(date: Date): { dateString: string, pathString: string, timeStamp: number } {
    const year: number = date.getFullYear();
    const month: string = String(date.getMonth() + 1).padStart(2, '0');
    const day: string = String(date.getDate()).padStart(2, '0');
    
    // 用于 Frontmatter: YYYY-MM-DD
    const dateString: string = `${year}-${month}-${day}`;
    // 用于目录结构: YYYY/MM/DD
    const pathString: string = `${year}/${month}/${day}`;
    
    return { dateString, pathString, timeStamp: Date.now() };
}

/**
 * 查找 src/content/ 下的一级目录作为内容集合
 * @returns 目录名称数组
 */
function getCollections(): string[] {
    const contentDir: string = path.resolve('src', 'content');
    if (!fs.existsSync(contentDir)) {
        console.error(`错误: 目录 ${contentDir} 不存在。请确认项目结构。`);
        return [];
    }
    
    // 读取目录内容，并过滤出文件夹
    // 明确指定 dirent 的类型为 fs.Dirent
    return fs.readdirSync(contentDir, { withFileTypes: true })
        .filter((dirent: fs.Dirent) => dirent.isDirectory())
        .map((dirent: fs.Dirent) => dirent.name);
}

// 移除了 touchFile 函数，因为创建新文件本身就会触发 Astro 的内容同步。

// --- Main Interactive Execution ---

async function createPost(): Promise<void> {
    // 获取当前日期，并将其时间重置为午夜，以便进行日期比较
    const now: Date = new Date();
    const todayMidnight: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 移除了 CONFIG_PATH 变量，不再需要手动触发 config 文件更新

    try {
        // 1. 选择内容集合目录 (blog/work/...)
        const collections: string[] = getCollections();
        if (collections.length === 0) {
            console.log('未找到任何内容集合目录 (src/content/下无子目录)。');
            return;
        }

        console.log('--- 内容集合选择 ---');
        collections.forEach((name, index) => {
            console.log(`[${index + 1}] ${name}`);
        });
        
        let selectedIndex: number = -1;
        let collectionName: string = '';

        while (selectedIndex < 0 || selectedIndex >= collections.length) {
            const input: string = await prompt(`请选择要创建文章的目录编号 (1-${collections.length}): `);
            selectedIndex = parseInt(input.trim()) - 1;
            if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= collections.length) {
                console.error('无效的输入，请重新输入编号。');
            } else {
                collectionName = collections[selectedIndex];
            }
        }
        console.log(`\n已选择目录: ${collectionName}`);
        
        // 2. 选择创建模式
        console.log('\n--- 文章创建模式 ---');
        console.log('[1] 默认创建当日文章 (文件名带时间戳后缀, 确保唯一)');
        console.log('[2] 重新创建指定日期的文章 (文件名不带时间戳)');
        
        let mode: number = 0;
        while (mode !== 1 && mode !== 2) {
            const input: string = await prompt('请选择模式编号 (1/2): ');
            mode = parseInt(input.trim());
            if (mode !== 1 && mode !== 2) {
                console.error('无效的输入，请选择 1 或 2。');
            }
        }
        
        // 3. 确定日期和文件信息
        let targetDate: Date = now; // Date object
        let datePath: string = '';   // YYYY/MM/DD
        let titleInput: string = '';
        let fileSuffix: string = ''; // 用于模式1的时间戳后缀

        if (mode === 1) {
            // 模式 1: 当日文章，带时间戳
            targetDate = now;
            
            const { pathString, timeStamp } = formatDate(targetDate);
            datePath = pathString; 
            fileSuffix = `_${timeStamp}`; 
            
            console.log(`\n模式 1: 将在今日路径 (${datePath}) 下创建文章。`);
        } else {
            // 模式 2: 指定日期文章，无时间戳
            console.log('\n模式 2: 请指定日期 (用于补发或回顾)。');
            let dateInput: string;
            const dateRegex: RegExp = /^\d{4}\/\d{2}\/\d{2}$/; // 匹配 YYYY/MM/DD 格式
            let dateIsValid: boolean = false;

            while (!dateIsValid) {
                dateInput = await prompt('请输入日期 (格式: YYYY/MM/DD): ');
                
                if (!dateRegex.test(dateInput)) {
                    console.error('⚠️ 日期格式错误，请使用 YYYY/MM/DD 格式。');
                    continue;
                }
                
                const parts: string[] = dateInput.split('/');
                // 转换成 Date 对象
                const inputDateObject: Date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                
                // 规范化输入日期时间为午夜，用于精确比较
                const inputDateMidnight: Date = new Date(inputDateObject.getFullYear(), inputDateObject.getMonth(), inputDateObject.getDate());

                // 检查是否为未来日期
                if (inputDateMidnight.getTime() > todayMidnight.getTime()) {
                    console.error('❌ 错误: 不能创建未来日期的文章。请重新输入今天的日期或过去的日期。');
                    continue;
                }

                // 日期验证通过
                datePath = dateInput;
                targetDate = inputDateObject; // 赋值
                dateIsValid = true;
            }
        }

        // 4. 获取文章标题
        // 仅允许中英文、数字、空格和连字符。
        const titleRegex: RegExp = /^[a-zA-Z0-9\u4e00-\u9fa5\s-]*$/; 

        while (!titleInput || !titleRegex.test(titleInput) || titleInput.trim().length === 0) {
            titleInput = await prompt('请输入文章标题 (仅限中英文/数字，无特殊符号): ');
            if (!titleRegex.test(titleInput)) {
                console.error('⚠️ 标题包含不允许的特殊符号或标点符号。');
            } else if (titleInput.trim().length === 0) {
                console.error('标题不能为空。');
            }
        }
        const finalTitle: string = titleInput.trim();
        const fileSlug: string = toSlug(finalTitle);


        // 5. 构造路径和文件内容
        const BASE_COLLECTION_DIR: string = path.resolve('src', 'content', collectionName);
        const TARGET_DIR: string = path.join(BASE_COLLECTION_DIR, datePath);
        // 最终的文件名 = slug + 模式后缀 (.md)
        const FILENAME: string = `${fileSlug}${fileSuffix}.md`;
        const TARGET_FILE_PATH: string = path.join(TARGET_DIR, FILENAME);
        
        // 确保使用 ISO 8601 格式输出
        const isoDate: string = targetDate.toISOString(); 

        const contentTemplate: string = `---
title: "${finalTitle}"
description: "在这里写下你的文章摘要..."
pubDate: ${isoDate}
author: "Mike"
tags: ["草稿"]
---

# ${finalTitle}

文章内容从这里开始。

您可以通过访问以下链接预览此文章：
/${collectionName}/${datePath}/${fileSlug}
`;

        // 6. 创建目录并写入文件
        fs.mkdirSync(TARGET_DIR, { recursive: true });

        if (fs.existsSync(TARGET_FILE_PATH)) {
            console.error(`\n❌ 错误: 文件已存在，创建失败!`);
            console.log(`路径: ${TARGET_FILE_PATH}`);
            if (mode === 2) {
                console.log('提示: 您正在尝试在指定日期下创建已存在的 slug。请修改标题或使用模式 1 (当日创建)。');
            }
            return;
        }

        fs.writeFileSync(TARGET_FILE_PATH, contentTemplate, 'utf8');
        
        // 移除了手动调用 touchFile(CONFIG_PATH);
        // 创建新文件本身就会触发 Astro 的内容同步。

        console.log(`
✅ 成功创建新文章!
--------------------------------------------------
📁 文件路径: ${TARGET_FILE_PATH}
🔗 预览 URL: /${collectionName}/${datePath}/${fileSlug}
--------------------------------------------------
⭐ 提示: 新创建的 Markdown 文件应该会被 Astro Dev Server 自动检测到并同步。
请编辑此文件并开始写作。
        `);

    } catch (error) {
        // 捕获可能不是 Error 对象的异常，将其转换为 string
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        console.error('在创建文件时发生错误:', errorMessage);
    } finally {
        rl.close(); // 确保关闭 readline 接口
    }
}

// 启动脚本
createPost();