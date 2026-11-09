"use client";

import { memo, useEffect, useRef, useState } from "react";
import type Quill from "quill";
import "quill/dist/quill.snow.css";

const toolbar = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "link"],
  ["clean"],
];

function visibleText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const QuillBox = memo(function QuillBox({
  initialHtml,
  onChange,
}: {
  initialHtml: string;
  onChange: (html: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let editor: Quill | null = null;

    (async () => {
      const { default: QuillEditor } = await import("quill");
      if (cancelled || !hostRef.current) return;
      editor = new QuillEditor(host, {
        theme: "snow",
        modules: { toolbar },
      });
      if (initialHtml) editor.clipboard.dangerouslyPasteHTML(initialHtml);
      editor.on("text-change", () => {
        if (cancelled || !editor) return;
        onChangeRef.current(editor.getSemanticHTML());
      });
    })();

    return () => {
      cancelled = true;
      const previous = host.previousElementSibling;
      if (previous?.classList.contains("ql-toolbar")) previous.remove();
      host.innerHTML = "";
      editor = null;
    };
  }, [initialHtml]);

  return <div ref={hostRef} className="min-h-48" />;
});

export default function PostEditor({
  action,
  submitLabel,
  initialHtml = "",
  postId,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  initialHtml?: string;
  postId?: string;
}) {
  const [html, setHtml] = useState(initialHtml);

  return (
    <form action={action} className="post-editor flex w-full flex-col gap-6">
      {postId ? <input type="hidden" name="postId" value={postId} /> : null}
      <input type="hidden" name="body" value={html} />
      <QuillBox initialHtml={initialHtml} onChange={setHtml} />
      <button
        type="submit"
        disabled={!visibleText(html)}
        className="h-14 w-full rounded-[12px] bg-[#2563eb] text-[16px] font-semibold text-white shadow-[0px_4px_6px_rgba(37,99,235,0.2)] hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </form>
  );
}
