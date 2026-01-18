import type { Word } from '@/typings'

// uTools 环境下可用的词典文件列表（与 copy-utools-assets.js 中的 utoolsDicts 保持一致）
const UTOOLS_AVAILABLE_DICTS = [
  'CET4_T.json',
  'CET6_T.json',
  'Level4luan_2_T.json',
  'KaoYan_3_T.json',
  'KaoYan_2024.json',
  '926.json',
  'IELTS_3_T.json',
  'TOEFL_3_T.json',
  'GRE_3_T.json',
  'GMAT_3_T.json',
  'SAT_3_T.json',
  'GaoKao_3500.json',
  'ZhongKaoHeXin.json',
  'top2000words.json',
  'Top1500NounWords.json',
  'Top1000VerbWords.json',
  'RogersWords.json',
  'itVocabulary.json',
  'it-words.json',
  'js-array.json',
  'js-date.json',
  'js-global.json',
  'js-map-set.json',
  'js-math.json',
  'js-number.json',
  'js-object.json',
  'js-promise.json',
  'js-string.json',
  'python-builtin.json',
  'python-array.json',
  'python-date.json',
  'python-file.json',
  'python-class.json',
  'python-set.json',
  'python-math.json',
  'python-string.json',
  'python-sys.json',
  'java-arraylist.json',
  'java-character.json',
  'java-hashmap.json',
  'java-linkedlist.json',
  'java-string.json',
  'java-stringBuffer.json',
  'csharp-keywords.json',
  'csharp-string.json',
  'csharp-list.json',
  'go_keyword.json',
  'go_builtin.json',
  'rust-keyword.json',
  'rust-string.json',
  'rust-vector.json',
  'rust-hashmap.json',
  'linux-command.json',
  'SQL_statement_lower-case.json',
  'SQL_statement_upper-case.json',
  'ai_machine_learning.json',
  'ai_for_science.json',
  'Child_python_code.json',
  'Child_python_turtle_code.json',
  'Child_cpp.json',
  'arduino_keywords.json',
]

// 检测是否为 uTools 构建版本（通过环境变量或特殊标记）
const isUtoolsBuild = typeof window !== 'undefined' && (window as any).__UTOOLS_BUILD__ === true

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

  // 提取文件名
  const fileName = url.split('/').pop() || ''

  // 如果在 uTools 环境，或者是 uTools 构建版本，检查词典是否在可用列表中
  if (isUtools || isUtoolsBuild) {
    if (!UTOOLS_AVAILABLE_DICTS.includes(fileName)) {
      const error = new Error('字典数据暂未上线，敬请期待')
      ;(error as any).isDictionaryNotAvailable = true
      console.log('Dictionary not available in uTools build:', fileName, { isUtools, isUtoolsBuild })
      throw error
    }
  }

  try {
    const response = await fetch(finalUrl)

    // 如果是404或其他HTTP错误，抛出错误但不影响应用其他部分
    if (!response.ok) {
      console.warn(`Failed to load dictionary from ${finalUrl}: ${response.status} ${response.statusText}`)

      // 如果是 404，且不在 uTools 可用列表中，给出友好提示
      if (response.status === 404 && !UTOOLS_AVAILABLE_DICTS.includes(fileName)) {
        const error = new Error('字典数据暂未上线，敬请期待')
        ;(error as any).isDictionaryNotAvailable = true
        throw error
      }

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
