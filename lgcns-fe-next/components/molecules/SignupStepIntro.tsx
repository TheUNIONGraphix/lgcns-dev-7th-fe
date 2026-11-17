export default function SignupStepIntro({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex items-center gap-2">
        <h2 className="text-[22px] leading-[normal] font-bold text-[#111827]">
          {title}
        </h2>
        {badge ? (
          <span className="rounded-[6px] bg-[#f3f4f6] px-2 py-1 text-[11px] leading-[normal] font-medium text-[#6b7280]">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="text-[14px] leading-[1.6] text-[#6b7280]">{description}</p>
    </div>
  );
}
