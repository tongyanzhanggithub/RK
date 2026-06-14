"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

async function uploadFile(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error || "上传失败。");
  }
  return data.url;
}

/** 主图：单张上传，绑定到 name="image" 的隐藏/可见输入。 */
export function MainImageUpload({
  name = "image",
  label = "主图",
  defaultValue = ""
}: {
  name?: string;
  label?: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file?: File) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      setValue(await uploadFile(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败。");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="上传后自动填入，或粘贴图片网址"
        className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-10 items-center gap-2 border border-navy px-3 text-sm font-black text-navy hover:bg-panel disabled:opacity-60"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          {uploading ? "上传中…" : "上传图片"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            className="inline-flex h-10 items-center gap-1 px-2 text-sm font-bold text-red-700 hover:underline"
          >
            <X size={14} /> 清除
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {error && <span className="text-xs font-bold text-red-700">{error}</span>}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="主图预览" className="mt-1 h-28 w-28 border border-line object-cover" />
      )}
    </label>
  );
}

/** 相册：多张上传，每张作为一行 `url | 说明` 追加到 name="imagesText" 的文本域。 */
export function GalleryUpload({
  name = "imagesText",
  label = "相册图片（每行：网址 | 说明 | primary）",
  defaultValue = ""
}: {
  name?: string;
  label?: string;
  defaultValue?: string;
}) {
  const [text, setText] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadFile(file));
      }
      setText((current) => {
        const lines = urls.map((url) => `${url} | `);
        return current.trim() ? `${current.trim()}\n${lines.join("\n")}` : lines.join("\n");
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败。");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const previews = text
    .split("\n")
    .map((line) => line.split("|")[0]?.trim())
    .filter(Boolean)
    .slice(0, 8);

  return (
    <label className="grid gap-2 text-sm font-bold md:col-span-2">
      {label}
      <textarea
        name={name}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="https://example.com/image.jpg | Alt text | primary"
        className="border border-line px-3 py-2 font-normal outline-none focus:border-navy"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-10 items-center gap-2 border border-navy px-3 text-sm font-black text-navy hover:bg-panel disabled:opacity-60"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          {uploading ? "上传中…" : "上传多张"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && <span className="text-xs font-bold text-red-700">{error}</span>}
      {previews.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-2">
          {previews.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="预览" className="h-16 w-16 border border-line object-cover" />
          ))}
        </div>
      )}
    </label>
  );
}
