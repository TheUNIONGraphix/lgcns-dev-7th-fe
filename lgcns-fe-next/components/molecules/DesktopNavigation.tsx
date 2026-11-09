import Link from "next/link";

export default function DesktopNavigation({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  return (
    <ul className="hidden items-center gap-4 md:flex">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href}>{item.label}</Link>
        </li>
      ))}
    </ul>
  );
}
