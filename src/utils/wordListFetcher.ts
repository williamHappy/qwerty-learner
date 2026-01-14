import type { Word } from '@/typings'

export async function wordListFetcher(url: string): Promise<Word[]> {
  const URL_PREFIX: string = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''

  try {
    const response = await fetch(URL_PREFIX + url)

    // 如果是404或其他HTTP错误，抛出错误但不影响应用其他部分
    if (!response.ok) {
      console.warn(`Failed to load dictionary from ${url}: ${response.status} ${response.statusText}`)
      throw new Error(`Dictionary not found: ${url}`)
    }

    const words: Word[] = await response.json()
    return words
  } catch (error) {
    // 记录错误，但允许应用继续运行
    console.error('Error fetching word list:', url, error)
    throw error
  }
}
