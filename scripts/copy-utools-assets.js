/**
 * 复制 uTools 插件所需的静态资源到构建目录
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

// 复制 public/dicts 目录到 dist/dicts (词库文件)
const dictsSource = path.join(__dirname, '..', 'public', 'dicts')
const dictsDest = path.join(distDir, 'dicts')

if (fs.existsSync(dictsSource)) {
  copyDirRecursive(dictsSource, dictsDest)
  console.log('Copied: dicts directory')
}

// 复制 public/sounds 目录到 dist/sounds (音效文件)
const soundsSource = path.join(__dirname, '..', 'public', 'sounds')
const soundsDest = path.join(distDir, 'sounds')

if (fs.existsSync(soundsSource)) {
  copyDirRecursive(soundsSource, soundsDest)
  console.log('Copied: sounds directory')
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
