// 原代码，无修改
/**
 * [内容处理中间件]：聚合 Markdown 文件列表中的标签和分类数据，并计算数量。
 * 这个函数充当了从原始数据 (allPosts) 到最终展示数据 (sortedTags/sortedCategories) 的中间处理层。
 * * @param {Array<Object>} allPosts - 由 Astro.glob 或 getCollection 返回的文章列表。
 * @returns {Object} 包含 sortedTags 和 sortedCategories 的对象。
 */

export function aggregateContentData(allPosts) {
  try {
    // 1. 标签 (Tags) 计数逻辑
    const tagCounts = new Map();
    // 2. 分类 (Categories) 计数逻辑
    const categoryCounts = new Map();

    allPosts.forEach(post => {
      // 统计 Tags: 预期 post.data.tags 是一个字符串数组
      // 确保使用 post.data
      if (post.data.tags && Array.isArray(post.data.tags)) {
        post.data.tags.forEach(tag => {
          // 规范化标签名称 (小写 slug)，这是路由的基础
          const normalizedTag = tag.toString().trim().toLowerCase().replace(/\s+/g, '-');

          // 保持对所有标签的统计
          tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
        });
      }

      // --- 分类统计逻辑 (处理 category 或 categories 字段) ---
      let rawCategory = post.data.category || post.data.categories;

      if (rawCategory) {
        // 如果是数组 (例如用户错误地使用了数组)，取第一个元素
        if (Array.isArray(rawCategory) && rawCategory.length > 0) {
          rawCategory = rawCategory[0];
        }

        if (typeof rawCategory === 'string' && rawCategory.trim() !== '') {
          const category = rawCategory;
          // 保持分类名称大小写 (用于显示)，并生成小写 slug (用于 URL/键)
          const normalizedCategory = category.trim();
          const categorySlug = normalizedCategory.toLowerCase().replace(/\s+/g, '-');

          const currentCount = categoryCounts.get(categorySlug)?.count || 0;
          categoryCounts.set(categorySlug, {
            name: normalizedCategory, // 用于显示
            slug: categorySlug,       // 用于 URL
            count: currentCount + 1
          });
        }
      }
    });

    // 格式化输出：将 Map 转换为排序后的数组

    // Tags: [["javascript", 5], ["astro", 3]]
    // 注意：这里返回的键 (tag) 已经是小写的 slug
    const sortedTags = Array.from(tagCounts.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    // Categories: [{ slug: "technology", name: "Technology", count: 2 }, ...]
    const sortedCategories = Array.from(categoryCounts.entries())
      .map(([slug, data]) => ({ slug, ...data }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      sortedTags,
      sortedCategories
    };
  } catch (error) {
    console.error('Error in aggregateContentData:', error);
    return {
      sortedTags: [],
      sortedCategories: []
    };
  }

}