import sanitizeHtml from "sanitize-html";

const options: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "a",
    "ol",
    "ul",
    "li",
    "h1",
    "h2",
    "h3",
    "blockquote",
    "span",
  ],
  allowedAttributes: {
    a: ["href", "rel", "target"],
    li: ["class", "data-list"],
    span: ["class"],
  },
  allowedClasses: {
    li: [/^ql-indent-\d+$/],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

export function sanitizePostHtml(value: string) {
  return sanitizeHtml(value, options).trim();
}

export function postText(html: string) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
