import { renderMarkdown } from "@/lib/xmind/markdown"
import { parseXMindArchive } from "@/lib/xmind/parser"
import type { ConversionResult } from "@/lib/xmind/types"

export async function convertXMindFile(file: File): Promise<ConversionResult> {
  if (!file.name.toLowerCase().endsWith(".xmind")) {
    throw new Error("请选择 .xmind 文件")
  }

  const workbook = await parseXMindArchive(await file.arrayBuffer())

  return {
    markdown: renderMarkdown(workbook),
    summary: workbook.summary,
    warnings: [],
  }
}
