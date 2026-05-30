import JSZip from "jszip"

import type { XMindSheet, XMindTopic, XMindWorkbook } from "@/lib/xmind/types"

export async function parseXMindArchive(
  buffer: ArrayBuffer,
): Promise<XMindWorkbook> {
  let archive: JSZip

  try {
    archive = await JSZip.loadAsync(buffer)
  } catch {
    throw new Error("无法读取 XMind 文件：文件不是有效的 zip/xmind 格式")
  }

  const contentFile = archive.file("content.json")
  if (!contentFile) {
    throw new Error("未找到 content.json：当前仅支持现代 .xmind 文件")
  }

  let rawContent: unknown
  try {
    rawContent = JSON.parse(await contentFile.async("string"))
  } catch {
    throw new Error("content.json 不是有效的 JSON")
  }

  const sheets = parseSheets(rawContent)
  if (sheets.length === 0) {
    throw new Error("没有可转换的 Sheet")
  }

  return {
    sheets,
    summary: {
      sheetCount: sheets.length,
      topicCount: sheets.reduce(
        (total, sheet) => total + countTopics(sheet.rootTopic),
        0,
      ),
    },
  }
}

function parseSheets(rawContent: unknown): XMindSheet[] {
  if (!Array.isArray(rawContent)) {
    throw new Error("content.json 结构不符合现代 XMind 格式")
  }

  return rawContent
    .map((sheet, index) => parseSheet(sheet, index))
    .filter((sheet): sheet is XMindSheet => Boolean(sheet))
}

function parseSheet(rawSheet: unknown, index: number): XMindSheet | null {
  if (!isRecord(rawSheet)) {
    return null
  }

  const rootTopic = parseTopic(rawSheet.rootTopic)
  if (!rootTopic) {
    return null
  }

  return {
    id: asOptionalString(rawSheet.id),
    title: asNonEmptyString(rawSheet.title) ?? `Sheet ${index + 1}`,
    rootTopic,
  }
}

function parseTopic(rawTopic: unknown): XMindTopic | null {
  if (!isRecord(rawTopic)) {
    return null
  }

  const title = asNonEmptyString(rawTopic.title)
  if (!title) {
    return null
  }

  return {
    id: asOptionalString(rawTopic.id),
    title,
    children: parseChildren(rawTopic.children),
  }
}

function parseChildren(rawChildren: unknown): XMindTopic[] {
  if (!isRecord(rawChildren)) {
    return []
  }

  return Object.values(rawChildren)
    .flatMap((group) => (Array.isArray(group) ? group : []))
    .map(parseTopic)
    .filter((topic): topic is XMindTopic => Boolean(topic))
}

function countTopics(topic: XMindTopic): number {
  return 1 + topic.children.reduce((total, child) => total + countTopics(child), 0)
}

function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
