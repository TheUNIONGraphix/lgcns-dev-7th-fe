function strengthScore(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8 && password.length <= 20) score += 1;
  if (/[A-Za-z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) && score === 2) score += 1;
  return score;
}

export default function SignupPasswordMeter({ password }: { password: string }) {
  const score = strengthScore(password);

  return (
    <div className="flex items-center gap-2">
      <span className="flex w-20 gap-1" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={`h-1 min-w-0 flex-1 rounded-full ${index < score ? "bg-[#2563eb]" : "bg-[#e5e7eb]"}`}
          />
        ))}
      </span>
      {score === 3 ? (
        <span className="text-[12px] leading-[normal] text-[#2563eb]">
          안전한 비밀번호
        </span>
      ) : null}
    </div>
  );
}
