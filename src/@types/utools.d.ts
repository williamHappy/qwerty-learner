/**
 * uTools API 类型定义
 */

interface UToolsFeature {
  code: string
  explain: string
  cmds: string[]
  icon?: string
  platform?: string[]
}

interface UToolsPluginEnterEvent {
  code: string
  type: string
  payload?: string
}

interface UToolsDbDoc {
  _id: string
  _rev?: string
  data?: any
  [key: string]: any
}

interface UToolsDbResult {
  ok: boolean
  id?: string
  rev?: string
  error?: string
}

interface UToolsDb {
  put(doc: UToolsDbDoc): UToolsDbResult
  get(id: string): UToolsDbDoc | null
  remove(doc: UToolsDbDoc | string): UToolsDbResult
  allDocs(key?: string): UToolsDbDoc[]
  bulkDocs(docs: UToolsDbDoc[]): UToolsDbResult[]
}

interface UToolsUser {
  avatar: string
  nickname: string
  type: string
}

interface UTools {
  // 事件相关
  onPluginEnter(callback: (action: UToolsPluginEnterEvent) => void): void
  onPluginOut(callback: () => void): void
  onPluginDetach(callback: () => void): void
  onMainPush(callback: (action: any, callbackSetList: any) => void): void

  // 窗口相关
  hideMainWindow(): boolean
  showMainWindow(): boolean
  setExpendHeight(height: number): boolean
  setSubInput(onChange: (params: { text: string }) => void, placeholder?: string, isFocus?: boolean): boolean
  removeSubInput(): boolean
  setSubInputValue(value: string): boolean
  subInputFocus(): boolean
  subInputBlur(): boolean
  outPlugin(): boolean
  redirect(label: string | string[], payload?: string): boolean

  // 数据库
  db: UToolsDb
  dbStorage: {
    setItem(key: string, value: any): void
    getItem(key: string): any
    removeItem(key: string): void
  }

  // 用户相关
  getUser(): UToolsUser | null
  fetchUserPayments(): Promise<any>

  // 系统相关
  getPath(name: 'home' | 'appData' | 'userData' | 'temp' | 'desktop' | 'documents' | 'downloads'): string
  copyText(text: string): boolean
  copyImage(image: string): boolean
  copyFile(file: string | string[]): boolean
  shellOpenPath(path: string): void
  shellShowItemInFolder(path: string): void
  shellOpenExternal(url: string): void
  shellBeep(): void
  getLocalId(): string
  getFileIcon(path: string): string
  readCurrentFolderPath(): string | null
  readCurrentBrowserUrl(): string | null

  // 屏幕相关
  screenColorPick(callback: (color: { hex: string; rgb: string }) => void): void
  screenCapture(callback: (imgBase64: string) => void): void
  getCursorScreenPoint(): { x: number; y: number }
  getDisplayNearestPoint(point: { x: number; y: number }): any
  getAllDisplays(): any[]
  getPrimaryDisplay(): any

  // 模拟操作
  simulateKeyboardTap(key: string, ...modifiers: string[]): void
  simulateMouseClick(x?: number, y?: number): void
  simulateMouseRightClick(x?: number, y?: number): void
  simulateMouseDoubleClick(x?: number, y?: number): void
  simulateMouseMove(x: number, y: number): void

  // 其他
  showNotification(body: string, clickFeatureCode?: string): void
  isDarkColors(): boolean
  getIdleUToolsPayloads(): any[]
}

declare global {
  interface Window {
    utools?: UTools
    utoolsDb?: UToolsDb
    utoolsHelper?: {
      isUtools: () => boolean
      hideMainWindow: () => void
      showMainWindow: () => void
      setSubInput: (onChange: (params: { text: string }) => void, placeholder?: string, isFocus?: boolean) => void
      removeSubInput: () => void
      getUser: () => UToolsUser | null
      copyText: (text: string) => boolean
      showNotification: (body: string, clickFeatureCode?: string) => void
      redirect: (label: string | string[], payload?: string) => void
      getPath: (name: string) => string
      shellOpenExternal: (url: string) => void
    }
  }

  const utools: UTools | undefined
}

export {}
