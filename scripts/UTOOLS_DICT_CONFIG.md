# uTools 插件字典配置说明

## 问题背景

uTools 插件包大小限制为 20MB，但项目包含 380+ 个字典文件，总大小超过 70MB，导致无法直接打包。

## 解决方案

采用**选择性复制字典**的方式，在打包 uTools 插件时只复制核心和常用字典，将字典文件大小从 70MB+ 降低到 10.56MB。

## 实现细节

### 1. 修改构建配置

**文件**: `vite.config.ts`

```typescript
build: {
  // uTools构建时不复制public目录，由copy-utools-assets.js脚本选择性复制
  copyPublicDir: !isUtools,
}
```

- uTools 构建时，Vite 不会自动复制 `public` 目录
- 由 `copy-utools-assets.js` 脚本负责选择性复制资源

### 2. 优化复制脚本

**文件**: `scripts/copy-utools-assets.js`

增加了 `utoolsDicts` 配置数组，定义需要保留的字典文件：

```javascript
const utoolsDicts = [
  // 核心英语字典
  'CET4_T.json', // 四级
  'CET6_T.json', // 六级
  'KaoYan_3_T.json', // 考研核心
  'IELTS_3_T.json', // 雅思核心
  'TOEFL_3_T.json', // 托福核心
  'GRE_3_T.json', // GRE核心
  'GaoKao_3500.json', // 高考3500

  // 代码字典（全部保留）
  'it-words.json',
  'js-array.json',
  'python-builtin.json',
  'java-arraylist.json',
  // ... 所有编程相关字典
]
```

新增 `copyDictsSelectively()` 函数，只复制配置中的字典文件。

### 3. 增强错误处理

**文件**: `src/utils/wordListFetcher.ts`

改进了字典加载的错误处理：

```typescript
export async function wordListFetcher(url: string): Promise<Word[]> {
  try {
    const response = await fetch(URL_PREFIX + url)

    if (!response.ok) {
      console.warn(`Failed to load dictionary from ${url}`)
      throw new Error(`Dictionary not found: ${url}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching word list:', url, error)
    throw error
  }
}
```

- 当字典文件不存在（404）时，会记录警告但不会导致应用崩溃
- SWR 会处理错误状态，UI 会显示加载失败提示

## 保留的字典类别

### 英语字典 (18 个)

- **大学英语**: CET-4, CET-6, 专四
- **考研**: 考研核心, 考研 2024, 926 核心词汇
- **国际考试**: IELTS, TOEFL, GRE, GMAT, SAT (各 1 个核心版本)
- **高中/初中**: 高考 3500, 中考核心
- **常用词汇**: Top 2000, Top 1500 名词, Top 1000 动词, Roger's Words
- **专业英语**: 计算机专业词汇

### 代码字典 (43 个)

- **通用**: it-words.json (程序员常见词)
- **JavaScript**: 9 个 (Array, Date, Object, String, etc.)
- **Python**: 9 个 (builtin, array, string, etc.)
- **Java**: 6 个 (ArrayList, HashMap, String, etc.)
- **C#**: 3 个 (keywords, string, list)
- **Go**: 2 个 (keyword, builtin)
- **Rust**: 4 个 (keyword, string, vector, hashmap)
- **其他**: Linux 命令, SQL, AI 词汇, 少儿编程

**总计**: 61 个字典文件，10.56 MB

## 构建命令

```bash
# 完整构建（推荐）
yarn build:utools

# 或分步执行
CI=false BUILD_TARGET=utools npx vite build --base=./
node scripts/copy-utools-assets.js
```

## 最终包大小

- **字典文件**: 10.56 MB (61 个文件)
- **其他资源**: 6-7 MB (代码、图片、音效等)
- **总计**: ~17 MB (远低于 20MB 限制)

## 如何添加/删除字典

1. 编辑 `scripts/copy-utools-assets.js`
2. 在 `utoolsDicts` 数组中添加或删除字典文件名
3. 重新构建: `yarn build:utools`

## 注意事项

1. **所有字典文件保留在 `public/dicts` 中**，不影响 Web 版本
2. **用户界面仍显示所有字典**，缺失的字典在加载时会显示错误提示
3. **错误处理确保应用稳定**，不会因为缺少字典文件而崩溃
4. **定期审查字典配置**，根据用户反馈调整保留的字典

## 故障排查

### 问题：构建后包仍然很大

1. 检查 `vite.config.ts` 中的 `copyPublicDir: !isUtools` 配置
2. 确认使用了 `BUILD_TARGET=utools` 环境变量
3. 检查 `utools/dist` 目录，确认只有配置的字典文件

### 问题：字典加载失败

1. 检查 `utoolsDicts` 配置，确认字典文件名正确
2. 查看浏览器控制台，确认是预期的 404 错误
3. 如需添加字典，在 `utoolsDicts` 中添加文件名后重新构建

### 问题：应用崩溃

1. 检查 `wordListFetcher.ts` 的错误处理代码
2. 确认 UI 组件正确处理 SWR 的 error 状态
3. 查看浏览器控制台的错误日志

## 相关文件

- `scripts/copy-utools-assets.js` - 资源复制脚本
- `vite.config.ts` - 构建配置
- `src/utils/wordListFetcher.ts` - 字典加载逻辑
- `src/resources/dictionary.ts` - 字典索引（全量，不受影响）
