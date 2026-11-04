const STEPS = [
  { id: 1, label: "아이디" },
  { id: 2, label: "비밀번호" },
  { id: 3, label: "이메일" },
  { id: 4, label: "프로필" },
] as const;

export default function SignupProgress({ step }: { step: number }) {
  const stepNumber = step === 2 || step === 3 || step === 4 ? step : 1;

  return (
    <div className="flex w-full flex-col gap-3" aria-label="회원가입 4단계">
      <ol className="flex w-full gap-2">
        {STEPS.map((item) => {
          const active = item.id === stepNumber;
          const done = item.id < stepNumber;
          return (
            <li
              key={item.id}
              className={`flex min-w-0 flex-1 items-center justify-center gap-[5px] text-[12px] leading-[normal] whitespace-nowrap ${
                active || done ? "text-[#2563eb]" : "text-[#9ca3af]"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {done ? (
                <img src="/signup/check-13.svg" alt="" width={13} height={13} className="h-[13px] w-[13px] max-w-none" />
              ) : (
                <span className="font-semibold">{item.id}</span>
              )}
              <span className={active ? "font-bold" : "font-medium"}>{item.label}</span>
            </li>
          );
        })}
      </ol>
      <div className="flex w-full gap-[6px]">
        {STEPS.map((item) => (
          <span
            key={item.id}
            className={`h-1 min-w-0 flex-1 rounded-full ${item.id <= stepNumber ? "bg-[#2563eb]" : "bg-[#e5e7eb]"}`}
          />
        ))}
      </div>
    </div>
  );
}
