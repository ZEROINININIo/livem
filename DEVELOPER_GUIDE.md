
# Nova Labs Archive - 内容开发与维护手册

欢迎来到 **Nova Labs Archive** 的后台文档。本手册旨在帮助第三方开发者或内容协作者快速理解项目结构，并进行剧情添加、角色更新及配置修改。

---

## 1. 核心目录结构

本项目基于 React (TypeScript)。以下是与内容维护最相关的目录：

*   **`src/data/`**: 静态数据核心仓库。所有文本、剧情、角色设定都在这里。
    *   `chapters.ts` & `chapter_files/`: **主线**剧情数据。
    *   `sideStories.ts` & `side_story_files/`: **支线**剧情数据。
    *   `characters.ts`: 主角团（人员档案）设定。
    *   `sideCharacters.ts`: 支线角色/NPC 设定。
    *   `lore.ts`: 数据库（世界观）条目。
    *   `credits.ts`: 特别鸣谢名单。
*   **`src/components/`**: UI 组件。通常不需要修改，除非涉及视觉样式调整。
*   **`src/types.ts`**: TypeScript 类型定义。如果新增了数据字段，需在此更新接口。

---

## 2. 如何添加剧情章节

### 2.1 添加主线章节 (Main Story)

1.  **创建文件**: 在 `src/data/chapter_files/` 下创建一个新文件，例如 `A006.ts`。
2.  **编写内容**: 复制现有章节的结构。
    ```typescript
    import { Chapter } from '../../types';

    export const chapterA006: Chapter = {
      id: "story-chapter-id", // 唯一ID
      date: "档案记录: A-006", // 显示在卡片上的日期/编号
      status: 'published', // 'published' (解锁), 'locked' (锁定), 'corrupted' (故障风)
      translations: {
        'zh-CN': {
          title: "章节标题",
          summary: "卡片上显示的简短摘要。",
          content: `这里是正文内容...` // 支持特殊标签，见下文
        },
        'zh-TW': { ... },
        'en': { ... }
      }
    };
    ```
3.  **注册章节**: 打开 `src/data/chapters.ts`，导入新文件并将其添加到数组中。

### 2.2 添加支线章节 (Side Story)

1.  **创建文件**: 在 `src/data/side_story_files/` 下创建文件。
2.  **编写内容**: 结构同上。
3.  **注册章节**: 打开 `src/data/sideStories.ts`。
    *   找到对应的 **Volume** (例如 `VOL_DAILY` 是日常篇)。
    *   将新章节变量添加到该 Volume 的 `chapters` 数组中。
    *   *注意*: 如果需要创建新的 Volume，请参考 `sideStories.ts` 中的 `SideStoryVolume` 结构。

---

## 3. 剧情文本特殊标签 (Rich Text Tags)

为了增强阅读体验，阅读器支持以下自定义标签。直接在 `content` 字符串中使用即可。

| 标签语法 | 效果 | 备注 |
| :--- | :--- | :--- |
| `[[DIVIDER]]` | 分割线 | 用于场景切换，显示一个带有 `///` 的分割符。 |
| `[[IMAGE::url::caption]]` | 插入图片 | `url`: 图片链接, `caption`: 图片说明（显示在右下角）。 |
| `[[DANGER::文本]]` | 红色警报文本 | 带有故障动画的红色粗体字，常用于系统警告。 |
| `[[GREEN::文本]]` | 绿色终端文本 | 绿色等宽字体，用于显示系统日志或代码。 |
| `[[BLUE::文本]]` | 蓝色提示文本 | 蓝色文本，常用于场景说明或旁白。 |
| `[[VOID::文本]]` | 紫色虚空文本 | 紫色故障风文本，用于 Void 的发言。 |
| `[[MASK::文本]]` | 遮罩文本 | 默认黑条遮挡，点击后显示内容（防剧透/神秘感）。 |
| `[[GLITCH_GREEN::文本]]` | 绿色故障字 | 带有强烈故障动画的绿色文本。 |
| `[[VOID_VISION::文本]]` | 虚空视界卡片 | **[New]** 生成一个可折叠的紫色卡片，用于隐藏长段的关键/剧透信息。 |
| `[[JUMP::VolumeID::Label]]` | 跳转按钮 | 生成一个按钮，点击后跳转到指定的支线卷（如 `VOL_PB`）。 |

**对话格式示例：**
阅读器会自动识别以 `名字：` 或 `Name:` 开头的行，并进行高亮处理。
```text
零点：“今天天气真好。” 
// 会自动识别为零点的台词并应用对应的主题色。
```

---

## 4. 视觉小说模式 (AVG Mode) 适配

系统内置了一个简易的 AVG 引擎。它会自动解析 `content` 文本并转换为演出。

*   **立绘显示**: 当检测到对话行（如 `白栖：“...”`）时，系统会尝试在 `utils/vnParser.ts` 中匹配角色 ID，并显示对应的立绘（如果有）。
*   **背景/氛围**:
    *   系统会根据章节 ID 前缀自动判断主题（如 `PB-` 是黑白主题，`story-daily` 是琥珀色日常主题）。
    *   这部分逻辑在 `utils/vnTheme.ts` 中。如果添加了新系列的支线，记得去这里配置主题。

---

## 5. 特别鸣谢与赞助 (Credits)

要添加新的赞助者，请修改 `src/data/credits.ts`。

```typescript
{
  id: "unique_id",
  name: "赞助者昵称",
  contribution: {
    'zh-CN': '赞助内容 (如 ¥50)',
    ...
  },
  tags: ["标签1", "标签2"], // 特殊标签: "Original Fan", "Founder" 会有金框特效
  date: "2026",
  message: "留言内容"
}
```

---

## 6. 更新日志 (Changelog)

每次发布新版本时，请更新 `src/data/updateLogs.ts`。
这不仅会在 UI 中显示，也是版本回溯的重要依据。

---

**Nova Labs Archive Project**
_Designed for the continuity of memories._
