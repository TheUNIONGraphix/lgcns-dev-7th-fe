const STEPS = [
  { id: 1, label: "아이디" },
  { id: 2, label: "비밀번호" },
  { id: 3, label: "관심사" },
  { id: 4, label: "프로필" },
] as const;

type SignupStep = (typeof STEPS)[number]["id"];

export type { SignupStep };

export default function SignupProgress({ current }: { current: SignupStep }) {
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="회원가입 4단계">
      {STEPS.map((step) => {
        const active = step.id === current;
        const done = step.id < current;
        return (
          <li
            key={step.id}
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
              {step.id}
            </span>
            <span className={`text-xs ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
