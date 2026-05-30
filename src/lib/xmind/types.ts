export interface XMindWorkbook {
  sheets: XMindSheet[]
  summary: ConversionSummary
}

export interface XMindSheet {
  id?: string
  title: string
  rootTopic: XMindTopic
}

export interface XMindTopic {
  id?: string
  title: string
  children: XMindTopic[]
}

export interface ConversionSummary {
  sheetCount: number
  topicCount: number
}

export interface ConversionResult {
  markdown: string
  summary: ConversionSummary
  warnings: string[]
}
