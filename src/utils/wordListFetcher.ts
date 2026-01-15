import type { Word } from '@/typings'

export async function wordListFetcher(url: string): Promise<Word[]> {
  // 判断是否在 uTools 环境中
  const isUtools = typeof window !== 'undefined' && (window as any).utools !== undefined

  let finalUrl: string

  if (isUtools) {
    // uTools 环境：将绝对路径转换为相对路径
    // /dicts/xxx.json -> ./dicts/xxx.json
    finalUrl = url.startsWith('/') ? '.' + url : url
  } else {
    // 非 uTools 环境：按原有逻辑处理
    const URL_PREFIX: string = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''
    finalUrl = URL_PREFIX + url
  }

  try {
    const response = await fetch(finalUrl)

    // 如果是404或其他HTTP错误，抛出错误但不影响应用其他部分
    if (!response.ok) {
      console.warn(`Failed to load dictionary from ${finalUrl}: ${response.status} ${response.statusText}`)
      throw new Error(`Dictionary not found: ${finalUrl}`)
    }

    const words: Word[] = await response.json()
    return words
  } catch (error) {
    // 记录错误，但允许应用继续运行
    console.error('Error fetching word list:', finalUrl, error)
    throw error
  }
}
