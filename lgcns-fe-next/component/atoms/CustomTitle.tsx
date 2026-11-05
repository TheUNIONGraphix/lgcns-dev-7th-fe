import { twMerge } from "tailwind-merge";

export default function CustomTitle({
  TitleType,
  className,
  children,
}: {
  TitleType: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <TitleType
      className={twMerge(
        "text-2xl font-bold text-center text-white",
        className,
      )}
    >
      {children}
    </TitleType>
  );
}
