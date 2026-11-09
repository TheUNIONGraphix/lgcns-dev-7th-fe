import { twMerge } from "tailwind-merge";

export default function CustomLi({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <li className={twMerge(className)}>{children}</li>;
}
