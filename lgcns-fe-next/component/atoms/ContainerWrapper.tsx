import { twMerge } from "tailwind-merge";

export default function ContainerWrapper({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={twMerge("mx-auto w-full max-w-3xl", className)}>{children}</div>;
}
