/**
 * uTools preload.js
 * 提供 uTools API 支持，使应用可以与 uTools 进行交互
 */

// 将 uTools API 暴露到 window 对象
window.utools = window.utools || {}

// 插件进入时的回调
window.utools.onPluginEnter = (callback) => {
  if (typeof utools !== 'undefined' && utools.onPluginEnter) {
    utools.onPluginEnter(callback)
  }
}

// 插件退出时的回调
window.utools.onPluginOut = (callback) => {
  if (typeof utools !== 'undefined' && utools.onPluginOut) {
    utools.onPluginOut(callback)
  }
}

// 存储相关 API
const db = {
  // 存储数据
  put: (doc) => {
    if (typeof utools !== 'undefined' && utools.db) {
      return utools.db.put(doc)
    }
    // 降级到 localStorage
    try {
      localStorage.setItem(`utools_${doc._id}`, JSON.stringify(doc))
      return { ok: true, id: doc._id, rev: Date.now().toString() }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  },

  // 获取数据
  get: (id) => {
    if (typeof utools !== 'undefined' && utools.db) {
      return utools.db.get(id)
    }
    // 降级到 localStorage
    try {
      const data = localStorage.getItem(`utools_${id}`)
      return data ? JSON.parse(data) : null
    } catch (e) {
      return null
    }
  },

  // 删除数据
  remove: (doc) => {
    if (typeof utools !== 'undefined' && utools.db) {
      return utools.db.remove(doc)
    }
    // 降级到 localStorage
    try {
      const id = typeof doc === 'string' ? doc : doc._id
      localStorage.removeItem(`utools_${id}`)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  },

  // 批量获取
  allDocs: (key) => {
    if (typeof utools !== 'undefined' && utools.db) {
      return utools.db.allDocs(key)
    }
    // 降级到 localStorage
    const result = []
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i)
      if (storageKey && storageKey.startsWith(`utools_${key}`)) {
        try {
          result.push(JSON.parse(localStorage.getItem(storageKey)))
        } catch (e) {
          // ignore
        }
      }
    }
    return result
  },
}

window.utoolsDb = db

// 辅助工具函数
window.utoolsHelper = {
  // 检测是否在 uTools 环境中
  isUtools: () => {
    return typeof utools !== 'undefined'
  },

  // 隐藏主窗口
  hideMainWindow: () => {
    if (typeof utools !== 'undefined' && utools.hideMainWindow) {
      utools.hideMainWindow()
    }
  },

  // 显示主窗口
  showMainWindow: () => {
    if (typeof utools !== 'undefined' && utools.showMainWindow) {
      utools.showMainWindow()
    }
  },

  // 设置子输入框
  setSubInput: (onChange, placeholder, isFocus) => {
    if (typeof utools !== 'undefined' && utools.setSubInput) {
      utools.setSubInput(onChange, placeholder, isFocus)
    }
  },

  // 移除子输入框
  removeSubInput: () => {
    if (typeof utools !== 'undefined' && utools.removeSubInput) {
      utools.removeSubInput()
    }
  },

  // 获取用户信息
  getUser: () => {
    if (typeof utools !== 'undefined' && utools.getUser) {
      return utools.getUser()
    }
    return null
  },

  // 复制到剪贴板
  copyText: (text) => {
    if (typeof utools !== 'undefined' && utools.copyText) {
      return utools.copyText(text)
    }
    // 降级处理
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      return true
    }
    return false
  },

  // 显示通知
  showNotification: (body, clickFeatureCode) => {
    if (typeof utools !== 'undefined' && utools.showNotification) {
      utools.showNotification(body, clickFeatureCode)
    } else {
      // 降级到浏览器通知
      if (Notification.permission === 'granted') {
        new Notification('Qwerty Learner', { body })
      }
    }
  },

  // 跳转到指定功能
  redirect: (label, payload) => {
    if (typeof utools !== 'undefined' && utools.redirect) {
      utools.redirect(label, payload)
    }
  },

  // 获取当前路径
  getPath: (name) => {
    if (typeof utools !== 'undefined' && utools.getPath) {
      return utools.getPath(name)
    }
    return ''
  },

  // 打开外部链接
  shellOpenExternal: (url) => {
    if (typeof utools !== 'undefined' && utools.shellOpenExternal) {
      utools.shellOpenExternal(url)
    } else {
      window.open(url, '_blank')
    }
  },
}

// 监听插件进入事件，处理不同的 feature code
if (typeof utools !== 'undefined') {
  utools.onPluginEnter(({ code, type, payload }) => {
    console.log('Plugin entered with:', { code, type, payload })

    // 将进入信息存储到 sessionStorage，供应用读取
    sessionStorage.setItem('utools_enter_code', code)
    sessionStorage.setItem('utools_enter_type', type)
    sessionStorage.setItem('utools_enter_payload', payload || '')

    // 触发自定义事件，通知应用
    window.dispatchEvent(
      new CustomEvent('utoolsEnter', {
        detail: { code, type, payload },
      }),
    )
  })

  utools.onPluginOut(() => {
    console.log('Plugin exited')
    // 清理 sessionStorage
    sessionStorage.removeItem('utools_enter_code')
    sessionStorage.removeItem('utools_enter_type')
    sessionStorage.removeItem('utools_enter_payload')

    window.dispatchEvent(new CustomEvent('utoolsExit'))
  })
}

console.log('uTools preload.js loaded')
