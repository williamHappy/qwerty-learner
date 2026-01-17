# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

Qwerty Learner 是一个基于 React 的打字练习应用，专为键盘工作者设计，用于记忆英语单词和构建肌肉记忆。它将词汇学习与打字练习相结合，支持多种词库（CET-4/6、GRE、IELTS、编程 API 等）和部署平台（Web、uTools 插件）。

## 开发命令

### 基础开发
- `yarn dev` 或 `yarn start` - 启动开发服务器（localhost:5173）
- `yarn build` - 构建 Web 部署版本
- `yarn lint` - 运行 ESLint
- `yarn prettier` - 使用 Prettier 格式化代码

### uTools 插件开发
- `yarn build:utools` - 构建 uTools 插件（通过 `copy-utools-assets.js` 复制选定资源）
- `yarn utools:dev` - 启动 uTools 开发服务器（端口 5173）
- `yarn utools:copy-assets` - 独立运行 uTools 资源复制脚本

### 测试
- `yarn test:e2e` - 运行 Playwright 端到端测试
- `yarn test` - 当前未配置测试

## 架构

### 状态管理
应用使用 **Jotai** 进行状态管理，采用两种模式：

1. **全局 Atoms**（`src/store/index.ts`）：
   - 使用 `atomWithStorage` 实现配置持久化
   - 词库选择、用户偏好、主题设置
   - 使用 `atom((get) => ...)` 模式派生计算值

2. **本地页面状态**（如 `src/pages/Typing/store/`）：
   - Context + Reducer 模式管理复杂的打字状态
   - 管理章节数据、计时器、打字进度、用户输入日志
   - 使用 Immer 进行不可变状态更新

### 路由策略
- **React Router v6** 动态路由选择
- uTools 环境使用 `HashRouter`，Web 环境使用 `BrowserRouter`
- Analysis 和 Gallery 页面懒加载
- 移动端检测并重定向到相应视图

### 页面结构
`src/pages/` 中的每个页面遵循一致的模式：
- `index.tsx` - 主页面组件
- `components/` - 页面特定组件
- `hooks/` - 页面逻辑的自定义 Hooks
- `store/` - 本地状态管理（如需要）

核心页面：
- **Typing**（`/`）- 主打字练习界面
- **Analysis** - 进度可视化，包含活动日历和图表
- **Gallery** - 成就展示
- **ErrorBook** - 错误单词复习模式

### 组件架构
- **Radix UI** 基础组件作为基石（Dialog、Dropdown、Tabs 等）
- **Tailwind CSS** 配合自定义设计系统
- **Headless UI** 提供额外组件
- `src/components/` 中的自定义组件用于共享 UI 元素

### 数据层
- **Dexie**（IndexedDB 封装）用于客户端数据库
- 存储复习记录、用户进度
- 支持导出/导入功能以实现数据迁移
- `src/utils/db/` 包含数据库模式和工具函数

### 词库系统
词库是 `public/dicts/` 中的 JSON 文件，结构如下：
```typescript
{
  name: string;
  description: string;
  length: number;
  category: string;
  data: Word[];  // 每章 20 个单词
}
```

词库元数据在 `src/resources/dictionary.ts` 中注册。应用从 public 目录动态加载词库数据。

### 音效系统
使用 **Howler.js** 实现多层音频：
- 按键音效（机械键盘等）
- 正确/错误反馈音
- 单词发音（通过有道 API 支持美音/英音）
- 背景音乐支持
- `src/store/index.ts` 中提供各类音量的独立控制

## 构建配置

### Vite 配置（`vite.config.ts`）
- **条件构建**：通过 `BUILD_TARGET=utools` 环境变量区分 Web 和 uTools
- **uTools 插件**：移除分析代码、修改 HTML、禁用 public 目录复制
- **包分析**：Rollup 可视化插件
- **Jotai 插件**：调试标签和 React Fast Refresh
- **路径别名**：`@/` → `src/`
- **控制台移除**：生产构建中移除 console/debugger

### uTools 集成
位于 `utools/` 目录：
- `plugin.json` - uTools 插件清单
- `preload.js` - uTools API 集成
- `copy-utools-assets.js` - 选择性资源复制以满足 20MB 大小限制

构建脚本有选择地复制词库（核心英语 + 编程 API）和音效文件以最小化插件大小。

### Tailwind 配置
- 暗色模式使用 class 策略
- 自定义尺寸实现精确布局控制
- Headless UI 和 forms 插件
- 词库布局的特殊屏幕尺寸
- `tailwind.config.js` 中的自定义动画

## 关键技术模式

### 打字引擎
核心打字逻辑（`src/pages/Typing/store/`）：
- 跟踪每个字母的用户输入和错误计数
- 计算 WPM（每分钟字数）和准确率
- 强制正确输入后才能继续（避免错误强化）
- 支持循环单词模式和随机章节模式
- 记录详细日志供 ErrorBook 复习

### 配置持久化
使用 `atomForConfig` 封装器管理用户偏好：
- 持久化到 localStorage
- 提供默认值
- 类型安全的配置对象
- 易于添加新配置项

### 移动端检测
应用检测移动设备并重定向到相应视图。打字界面主要针对桌面/键盘使用设计。

### 发音系统
- 从有道词典 API 获取音频
- 支持美音/英音发音类型
- 可配置播放速率和音量
- 可选翻译朗读功能

## 测试

### E2E 测试
- **Playwright** 用于端到端测试
- 测试文件应位于标准 Playwright 位置
- 使用 `yarn test:e2e` 运行

### 代码质量
- **ESLint** 集成 React 和 Prettier
- **Husky** git hooks 用于预提交检查
- **lint-staged** 对暂存文件运行 Prettier
- 通过 `@trivago/prettier-plugin-sort-imports` 进行导入排序

## 添加新词库

1. 在 `public/dicts/` 中创建遵循词库结构的 JSON 文件
2. 在 `src/resources/dictionary.ts` 中添加元数据
3. 对于 uTools 构建，在 `scripts/copy-utools-assets.js` 的 `utoolsDicts` 数组中添加
4. 测试词库加载和章节导航

详细词库创建指南参见 `docs/toBuildDict.md`。

## 常见模式

### 添加新用户偏好
```typescript
// 在 src/store/index.ts 中
export const newConfigAtom = atomForConfig('newConfig', {
  // 默认值
})

// 在组件中
const [config, setConfig] = useAtom(newConfigAtom)
```

### 创建新页面
1. 在 `src/pages/YourPage/` 中添加目录
2. 创建 `index.tsx` 和必要的组件
3. 在 `src/index.tsx` 中添加路由（非关键页面懒加载）
4. 在适当位置添加导航链接（Header、Settings 等）

### 打字状态管理
修改打字行为时，需要处理：
- `src/pages/Typing/store/index.ts` - Reducer actions 和 state
- `src/pages/Typing/store/type.ts` - 类型定义
- 确保使用 Immer 模式进行状态更新

## 平台特定考虑

### uTools 插件
- 大小限制：20MB（使用 `copy-utools-assets.js` 管理）
- HTML 中无外部网络调用（构建插件移除）
- 预加载脚本暴露 uTools API
- 所有资源必须本地打包

### Web 部署
- 使用 Vercel Analytics
- 支持外部网络调用
- public 目录复制到构建
- GitHub Pages 兼容（使用 `base: ./`）

## 代码风格

- **Prettier** 配合导入排序
- **CamelCase** 用于 CSS 模块（在 Vite 中配置）
- 函数式组件配合 Hooks
- TypeScript 严格模式启用
- **Tailwind** 工具类用于样式（优先使用工具类而非自定义 CSS）

## 重要说明

- 词库章节大小：每章 20 个单词（所有词库标准）
- 打字强制正确：错误字符必须重新输入（防止肌肉记忆错误）
- 所有状态变更应通过定义的 actions 或 atoms
- 添加新功能时，同时考虑 Web 和 uTools 平台
- 测试暗色模式兼容性（使用 `isOpenDarkModeAtom`）
- 移动端视图简化；专注于桌面键盘体验
