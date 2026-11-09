import { twMerge } from "tailwind-merge";

export default function CustomFlexWrapper({
  direction = "col",
  className,
  children,
}: {
  direction?: "col" | "row";
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={twMerge(`flex flex-${direction} gap-2`, className)}>{children}</div>;
}
