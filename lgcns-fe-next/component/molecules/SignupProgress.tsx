"use client";

import { useSearchParams } from "next/navigation";

const STEPS = [
  { id: 1, label: "아이디" },
  { id: 2, label: "비밀번호" },
  { id: 3, label: "관심사" },
  { id: 4, label: "프로필" },
] as const;


export default function SignupProgress() {

  const searchParams = useSearchParams();
  const raw = searchParams.get("step");
  const parsed = raw ? Number.parseInt(raw, 10) : 1;
  const stepNumber = parsed === 2 || parsed === 3 || parsed === 4 ? parsed : 1;
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="회원가입 4단계">
      {STEPS.map((item) => {
        const active = item.id === stepNumber;
        const done = item.id < stepNumber;
        return (
          <li
            key={item.id}
            className="flex flex-col items-center gap-1 text-center"
            aria-current={active ? "step" : undefined}
          >
            <span
              className={`inline-flex size-8 items-center justify-center rounded-full text-sm ${
                active
                  ? "bg-primary font-semibold text-primary-foreground ring-2 ring-primary ring-offset-2"
                  : done
                    ? "bg-primary/80 font-medium text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {item.id}
            </span>
            <span className={`text-xs ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
              {item.label}
            </span>
            <span
              className={`text-[10px] font-medium ${active ? "text-primary" : "invisible"}`}
              aria-hidden={active ? undefined : true}
            >
              현재
            </span>
          </li>
        );
      })}
    </ol>
  );
}
