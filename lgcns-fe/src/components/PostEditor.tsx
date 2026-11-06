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
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
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
      editor = new QuillEditor(host, { theme: "snow", modules: { toolbar } });
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

  return <div ref={hostRef} className="min-h-48 bg-white" />;
});

export default function PostEditor({
  initialHtml = "",
  submitLabel,
  pending,
  onSubmit,
}: {
  initialHtml?: string;
  submitLabel: string;
  pending: boolean;
  onSubmit: (html: string) => void;
}) {
  const [html, setHtml] = useState(initialHtml);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(html);
      }}
    >
      <QuillBox initialHtml={initialHtml} onChange={setHtml} />
      <button
        type="submit"
        disabled={pending || !visibleText(html)}
        className="h-11 rounded-xl bg-[#2563eb] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </form>
  );
}
