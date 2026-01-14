/**
 * 复制 uTools 插件所需的静态资源到构建目录
 * 针对utools插件大小限制（20M），只复制核心和常用字典
 */
const fs = require('fs')
const path = require('path')

const utoolsDir = path.join(__dirname, '..', 'utools')
const distDir = path.join(utoolsDir, 'dist')

// 确保 dist 目录存在
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true })
}

// 需要复制到 dist 目录的文件
const filesToCopy = ['plugin.json', 'preload.js', 'logo.png']

filesToCopy.forEach((file) => {
  const src = path.join(utoolsDir, file)
  const dest = path.join(distDir, file)

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
    console.log(`Copied: ${file}`)
  } else {
    console.warn(`Warning: ${file} not found in utools directory`)
  }
})

// uTools专用字典配置 - 只保留核心和常用字典以满足20M限制
const utoolsDicts = [
  // === 核心英语字典 (必备) ===
  // 大学英语
  'CET4_T.json', // 四级（必备）
  'CET6_T.json', // 六级（必备）
  'Level4luan_2_T.json', // 专四

  // 考研
  'KaoYan_3_T.json', // 考研核心
  'KaoYan_2024.json', // 考研2024
  '926.json', // 考研926核心

  // 国际考试（精选）
  'IELTS_3_T.json', // 雅思核心
  'TOEFL_3_T.json', // 托福核心
  'GRE_3_T.json', // GRE核心
  'GMAT_3_T.json', // GMAT
  'SAT_3_T.json', // SAT

  // 青少儿英语（必备）
  'GaoKao_3500.json', // 高考3500
  'ZhongKaoHeXin.json', // 中考核心

  // 常用词汇
  'top2000words.json',
  'Top1500NounWords.json',
  'Top1000VerbWords.json',
  'RogersWords.json', // 工作常用

  // 专业英语（精选）
  'itVocabulary.json', // 计算机专业

  // === 代码字典 (全保留) ===
  'it-words.json', // 程序员常见词（核心）

  // JavaScript
  'js-array.json',
  'js-date.json',
  'js-global.json',
  'js-map-set.json',
  'js-math.json',
  'js-number.json',
  'js-object.json',
  'js-promise.json',
  'js-string.json',

  // Python
  'python-builtin.json',
  'python-array.json',
  'python-date.json',
  'python-file.json',
  'python-class.json',
  'python-set.json',
  'python-math.json',
  'python-string.json',
  'python-sys.json',

  // Java
  'java-arraylist.json',
  'java-character.json',
  'java-hashmap.json',
  'java-linkedlist.json',
  'java-string.json',
  'java-stringBuffer.json',

  // C#
  'csharp-keywords.json',
  'csharp-string.json',
  'csharp-list.json',

  // Go
  'go_keyword.json',
  'go_builtin.json',

  // Rust
  'rust-keyword.json',
  'rust-string.json',
  'rust-vector.json',
  'rust-hashmap.json',

  // 其他
  'linux-command.json',
  'SQL_statement_lower-case.json',
  'SQL_statement_upper-case.json',
  'ai_machine_learning.json',
  'ai_for_science.json',

  // 少儿编程
  'Child_python_code.json',
  'Child_python_turtle_code.json',
  'Child_cpp.json',
  'arduino_keywords.json',
]

// 复制 public/dicts 目录到 dist/dicts (只复制配置中的词库文件)
const dictsSource = path.join(__dirname, '..', 'public', 'dicts')
const dictsDest = path.join(distDir, 'dicts')

if (fs.existsSync(dictsSource)) {
  copyDictsSelectively(dictsSource, dictsDest, utoolsDicts)
  console.log('Copied: selected dicts for utools')
}

// 复制 public/sounds 目录到 dist/sounds (音效文件)
const soundsSource = path.join(__dirname, '..', 'public', 'sounds')
const soundsDest = path.join(distDir, 'sounds')

if (fs.existsSync(soundsSource)) {
  copyDirRecursive(soundsSource, soundsDest)
  console.log('Copied: sounds directory')
}

// 选择性复制字典文件
function copyDictsSelectively(src, dest, allowedDicts) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  let totalSize = 0
  let copiedCount = 0
  const skippedFiles = []

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.json')) {
      if (allowedDicts.includes(entry.name)) {
        const srcPath = path.join(src, entry.name)
        const destPath = path.join(dest, entry.name)
        fs.copyFileSync(srcPath, destPath)
        const stats = fs.statSync(destPath)
        totalSize += stats.size
        copiedCount++
      } else {
        skippedFiles.push(entry.name)
      }
    }
  }

  console.log(`\n=== uTools 字典复制统计 ===`)
  console.log(`已复制: ${copiedCount} 个字典文件`)
  console.log(`总大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`跳过: ${skippedFiles.length} 个字典文件`)
}

// 递归复制目录
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

console.log('\\nuTools assets copy completed!')
