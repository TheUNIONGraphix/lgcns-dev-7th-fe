import { twMerge } from "tailwind-merge";

export default function CustomUl({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <ul className={twMerge("flex flex-col gap-4", className)}>{children}</ul>;
}
