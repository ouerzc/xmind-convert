import { useRef, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Loader2,
  RotateCcw,
  Upload,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { convertXMindFile } from "@/lib/xmind/converter"
import type { ConversionSummary } from "@/lib/xmind/types"

type ConversionState = "idle" | "converting" | "ready" | "error"

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<ConversionState>("idle")
  const [fileName, setFileName] = useState("")
  const [summary, setSummary] = useState<ConversionSummary | null>(null)
  const [markdown, setMarkdown] = useState("")
  const [error, setError] = useState("")
  const [copyLabel, setCopyLabel] = useState("复制")

  async function convertFile(file: File) {
    setState("converting")
    setError("")
    setFileName(file.name)
    setCopyLabel("复制")

    try {
      const result = await convertXMindFile(file)
      setMarkdown(result.markdown)
      setSummary(result.summary)
      setState("ready")
    } catch (caught) {
      setMarkdown("")
      setSummary(null)
      setState("error")
      setError(caught instanceof Error ? caught.message : "转换失败")
    }
  }

  function handleFiles(files: FileList | null) {
    const [file] = Array.from(files ?? [])
    if (file) {
      void convertFile(file)
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    handleFiles(event.dataTransfer.files)
  }

  async function handleCopy() {
    if (!markdown) {
      return
    }

    await navigator.clipboard.writeText(markdown)
    setCopyLabel("已复制")
    window.setTimeout(() => setCopyLabel("复制"), 1500)
  }

  function handleDownload() {
    if (!markdown) {
      return
    }

    const outputName = fileName.replace(/\.xmind$/i, "") || "xmind"
    const url = URL.createObjectURL(
      new Blob([markdown], { type: "text/markdown;charset=utf-8" }),
    )
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${outputName}.md`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function reset() {
    setState("idle")
    setFileName("")
    setSummary(null)
    setMarkdown("")
    setError("")
    setCopyLabel("复制")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const hasMarkdown = markdown.length > 0

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d8fbf0,transparent_30%),linear-gradient(135deg,#f8fafc,#eff6ff_52%,#f6f7fb)] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700">XMind to Markdown</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950">
              XMind 转 Markdown
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">本地解析</Badge>
            <Badge variant="outline">现代 .xmind</Badge>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-cyan-700" />
              选择文件
            </CardTitle>
            <CardDescription>拖入一个现代 XMind 文件，或从本机选择。</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-cyan-300 bg-cyan-50/65 px-4 py-8 text-center transition-colors hover:bg-cyan-50"
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                accept=".xmind,application/vnd.xmind.workbook"
                onChange={(event) => handleFiles(event.target.files)}
              />
              <div className="rounded-full bg-white p-3 shadow-sm ring-1 ring-cyan-100">
                {state === "converting" ? (
                  <Loader2 className="h-7 w-7 animate-spin text-cyan-700" />
                ) : (
                  <FileText className="h-7 w-7 text-cyan-700" />
                )}
              </div>
              <div className="space-y-1">
                <p className="font-medium text-slate-900">
                  {fileName || "等待 .xmind 文件"}
                </p>
                <p className="text-sm text-slate-600">
                  文件只在当前浏览器中读取和转换。
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={state === "converting"}
                >
                  <Upload className="h-4 w-4" />
                  选择 .xmind
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={reset}
                  disabled={state === "converting" && !fileName}
                >
                  <RotateCcw className="h-4 w-4" />
                  清空
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>无法转换</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              转换结果
            </CardTitle>
            <CardDescription>
              {summary
                ? `${summary.sheetCount} 个 Sheet，${summary.topicCount} 个节点，仅输出节点内容`
                : "转换完成后显示只包含导图节点内容的 Markdown。"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCopy}
                disabled={!hasMarkdown}
              >
                <Copy className="h-4 w-4" />
                {copyLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownload}
                disabled={!hasMarkdown}
              >
                <Download className="h-4 w-4" />
                下载 .md
              </Button>
            </div>
            <Separator />
            <Textarea
              className="min-h-[420px] resize-y font-mono text-sm leading-6"
              placeholder="Markdown 预览"
              readOnly
              value={markdown}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
