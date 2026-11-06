import { twMerge } from "tailwind-merge";

export default function CustomParagraph({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={twMerge(
        "font-sans text-[14px] leading-[normal] font-normal text-[#6b7280]",
        className,
      )}
    >
      {children}
    </p>
  );
}
