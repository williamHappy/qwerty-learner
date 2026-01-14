import react from '@vitejs/plugin-react'
import { promises as fs } from 'fs'
import { getLastCommit } from 'git-last-commit'
import jotaiDebugLabel from 'jotai/babel/plugin-debug-label'
import jotaiReactRefresh from 'jotai/babel/plugin-react-refresh'
import path from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import type { PluginOption } from 'vite'

// 判断是否为 uTools 构建模式
const isUtools = process.env.BUILD_TARGET === 'utools'

// uTools HTML 处理插件：移除网络资源引用
function utoolsHtmlPlugin(): PluginOption {
  return {
    name: 'utools-html-transform',
    apply: 'build',
    transformIndexHtml(html) {
      if (!isUtools) return html

      // 移除 Google Analytics 相关脚本（整个 script 标签）
      html = html.replace(/<!-- Google Analytics[\s\S]*?<\/script>/i, '')

      // 移除包含网络 URL 的注释
      html = html.replace(/\/\/\s*https?:\/\/[^\n]*/g, '')

      // 移除 preconnect 和 dns-prefetch link 标签
      html = html.replace(/<link\s+rel=["'](preconnect|dns-prefetch)["'][^>]*>/gi, '')

      // 移除 canonical link
      html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '')

      // 移除 source link
      html = html.replace(/<link\s+rel=["']source["'][^>]*>/gi, '')

      // 移除所有 Open Graph meta 标签
      html = html.replace(/<!-- Open Graph[\s\S]*?(?=<!--|<title|<link|<meta name=|<script)/i, '')

      // 移除所有 Twitter meta 标签
      html = html.replace(/<!-- Twitter[\s\S]*?(?=<link|<meta name=|<script)/i, '')

      // 移除 JSON-LD 结构化数据
      html = html.replace(/<!-- Structured Data[\s\S]*?<\/script>/i, '')

      return html
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const latestCommitHash = await new Promise<string>((resolve) => {
    return getLastCommit((err, commit) => (err ? 'unknown' : resolve(commit.shortHash)))
  })
  return {
    plugins: [
      react({ babel: { plugins: [jotaiDebugLabel, jotaiReactRefresh] } }),
      visualizer() as PluginOption,
      Icons({
        compiler: 'jsx',
        jsx: 'react',
        customCollections: {
          'my-icons': {
            xiaohongshu: () => fs.readFile('./src/assets/xiaohongshu.svg', 'utf-8'),
          },
        },
      }),
      utoolsHtmlPlugin(),
    ],
    build: {
      minify: true,
      outDir: isUtools ? 'utools/dist' : 'build',
      sourcemap: false,
      // uTools 构建时需要将资源打包成相对路径
      assetsDir: isUtools ? 'assets' : 'assets',
      rollupOptions: isUtools
        ? {
            output: {
              // uTools 插件需要将所有资源打包到一起
              manualChunks: undefined,
            },
          }
        : {},
      // uTools构建时不复制public目录，由copy-utools-assets.js脚本选择性复制
      copyPublicDir: !isUtools,
    },
    base: isUtools ? './' : './',
    esbuild: {
      drop: mode === 'development' ? [] : ['console', 'debugger'],
    },
    define: {
      REACT_APP_DEPLOY_ENV: JSON.stringify(process.env.REACT_APP_DEPLOY_ENV),
      LATEST_COMMIT_HASH: JSON.stringify(latestCommitHash + (process.env.NODE_ENV === 'production' ? '' : ' (dev)')),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
  }
})
