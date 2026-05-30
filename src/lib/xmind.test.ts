import JSZip from "jszip"
import { describe, expect, test } from "vitest"

import { parseXMindArchive } from "@/lib/xmind/parser"
import { renderMarkdown } from "@/lib/xmind/markdown"

async function createArchive(content: unknown): Promise<ArrayBuffer> {
  const zip = new JSZip()
  zip.file("content.json", JSON.stringify(content))
  return zip.generateAsync({ type: "arraybuffer" })
}

describe("parseXMindArchive", () => {
  test("parses a modern content.json workbook and summarizes all sheets", async () => {
    const archive = await createArchive([
      {
        id: "sheet-1",
        title: "产品规划",
        rootTopic: {
          id: "root-1",
          title: "路线图",
          children: {
            attached: [
              { id: "topic-1", title: "阶段一" },
              { id: "topic-2", title: "阶段二" },
            ],
          },
        },
      },
      {
        id: "sheet-2",
        title: "风险",
        rootTopic: {
          id: "root-2",
          title: "风险清单",
        },
      },
    ])

    const workbook = await parseXMindArchive(archive)

    expect(workbook.sheets).toHaveLength(2)
    expect(workbook.summary).toEqual({
      sheetCount: 2,
      topicCount: 4,
    })
  })

  test("rejects archives without content.json", async () => {
    const zip = new JSZip()
    zip.file("metadata.json", "{}")
    const archive = await zip.generateAsync({ type: "arraybuffer" })

    await expect(parseXMindArchive(archive)).rejects.toThrow(
      "未找到 content.json",
    )
  })
})

describe("renderMarkdown", () => {
  test("renders all sheets as grouped nested bullets", async () => {
    const archive = await createArchive([
      {
        title: "产品规划",
        rootTopic: {
          title: "路线图",
          children: {
            attached: [
              {
                title: "阶段一",
                children: {
                  attached: [{ title: "发布 MVP" }],
                },
              },
            ],
          },
        },
      },
      {
        title: "风险",
        rootTopic: {
          title: "风险清单",
        },
      },
    ])

    const workbook = await parseXMindArchive(archive)

    expect(renderMarkdown(workbook)).toBe(
      [
        "# 产品规划",
        "",
        "- 路线图",
        "  - 阶段一",
        "    - 发布 MVP",
        "",
        "# 风险",
        "",
        "- 风险清单",
        "",
      ].join("\n"),
    )
  })

  test("renders only node titles and skips metadata fields", async () => {
    const archive = await createArchive([
      {
        title: "知识库",
        rootTopic: {
          title: "资料整理",
          notes: {
            plain: {
              content: "把原始资料转成可检索条目",
            },
          },
          labels: ["LLM", "Workflow"],
          href: "https://example.com/source",
          markers: [
            {
              markerId: "priority-1",
            },
          ],
          children: {
            attached: [
              {
                title: "子任务",
                notes: "纯文本备注",
              },
            ],
          },
        },
      },
    ])

    const workbook = await parseXMindArchive(archive)

    expect(renderMarkdown(workbook)).toBe(
      [
        "# 知识库",
        "",
        "- 资料整理",
        "  - 子任务",
        "",
      ].join("\n"),
    )
  })

  test("skips unknown metadata fields", async () => {
    const archive = await createArchive([
      {
        title: "保真",
        rootTopic: {
          title: "节点",
          customData: {
            owner: "alice",
          },
          children: {
            attached: [],
          },
        },
      },
    ])

    const workbook = await parseXMindArchive(archive)

    expect(renderMarkdown(workbook)).toBe(["# 保真", "", "- 节点", ""].join("\n"))
  })

  test("rejects an empty workbook", async () => {
    const archive = await createArchive([])

    await expect(parseXMindArchive(archive)).rejects.toThrow("没有可转换的 Sheet")
  })
})
