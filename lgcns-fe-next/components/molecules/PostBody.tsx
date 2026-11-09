import "quill/dist/quill.snow.css";

function excerpt(html: string) {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= 140) return text;
  return `${text.slice(0, 140)}…`;
}

export default function PostBody({ body, full }: { body: string; full: boolean }) {
  const html = body.trimStart().startsWith("<");

  if (full && html) {
    return (
      <div className="ql-snow">
        <div
          className="ql-editor !px-0 !py-0 text-[15px] leading-7 text-[#1f2937]"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
    );
  }

  return (
    <p className="whitespace-pre-wrap text-[15px] leading-7 text-[#1f2937]">
      {full ? body : excerpt(body)}
    </p>
  );
}
