import type { ReactNode } from "react";

export default function SignupCheckMessage({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[13px] leading-[1.5] text-[#2563eb]">
      <img
        src="/signup/check-16.svg"
        alt=""
        width={16}
        height={16}
        className="h-4 w-4 max-w-none"
      />
      {children}
    </p>
  );
}
