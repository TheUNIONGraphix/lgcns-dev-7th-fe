import Link from "next/link";

export default function PostInlineLink({
  href,
  tone = "accent",
  children,
}: {
  href: string;
  tone?: "accent" | "default";
  children: string;
}) {
  return (
    <Link
      href={href}
      className={
        tone === "accent"
          ? "font-medium text-[#2563eb] hover:underline"
          : "font-medium text-[#374151] hover:underline"
      }
    >
      {children}
    </Link>
  );
}
