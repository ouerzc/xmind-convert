import type { XMindTopic, XMindWorkbook } from "@/lib/xmind/types"

export function renderMarkdown(workbook: XMindWorkbook): string {
  return `${workbook.sheets.map(renderSheet).join("\n\n")}\n`
}

function renderSheet(sheet: XMindWorkbook["sheets"][number]): string {
  return [`# ${escapeLine(sheet.title)}`, "", ...renderTopic(sheet.rootTopic, 0)].join(
    "\n",
  )
}

function renderTopic(topic: XMindTopic, depth: number): string[] {
  const lines = [`${indent(depth)}- ${escapeLine(topic.title)}`]

  for (const child of topic.children) {
    lines.push(...renderTopic(child, depth + 1))
  }

  return lines
}

function indent(depth: number): string {
  return "  ".repeat(depth)
}

function escapeLine(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}
