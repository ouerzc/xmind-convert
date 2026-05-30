import JSZip from "jszip"
import { describe, expect, test } from "vitest"

import { convertXMindFile } from "@/lib/xmind/converter"

async function createXMindFile(name: string): Promise<File> {
  const zip = new JSZip()
  zip.file(
    "content.json",
    JSON.stringify([
      {
        title: "导图",
        rootTopic: {
          title: "中心主题",
        },
      },
    ]),
  )
  const buffer = await zip.generateAsync({ type: "arraybuffer" })
  return new File([buffer], name, { type: "application/vnd.xmind.workbook" })
}

describe("convertXMindFile", () => {
  test("converts a modern .xmind file into markdown with summary", async () => {
    const result = await convertXMindFile(await createXMindFile("demo.xmind"))

    expect(result.summary).toEqual({
      sheetCount: 1,
      topicCount: 1,
    })
    expect(result.markdown).toBe(["# 导图", "", "- 中心主题", ""].join("\n"))
    expect(result.warnings).toEqual([])
  })

  test("rejects files that do not use the .xmind extension", async () => {
    await expect(convertXMindFile(await createXMindFile("demo.zip"))).rejects.toThrow(
      "请选择 .xmind 文件",
    )
  })
})
