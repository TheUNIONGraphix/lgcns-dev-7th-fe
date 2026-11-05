import type { ReactNode } from "react";
import SignupSubmitButton from "../atoms/SignupSubmitButton";

type SignupIntent = "next" | "back" | "skip";

const nextClassName =
  "h-14 min-w-0 flex-1 gap-2 rounded-[12px] bg-[#2563eb] px-4 text-[16px] font-semibold text-white shadow-[0px_4px_12px_0px_rgba(37,99,235,0.2)] hover:bg-[#1d4ed8]";

const backClassName =
  "h-14 w-[104px] shrink-0 rounded-[12px] border border-[#d1d5db] bg-white px-0 text-[16px] font-semibold text-[#374151] shadow-none hover:bg-white";

export default function SignupStepActions({
  showBack = false,
  showSkip = false,
  submitLabel,
  submitPendingLabel,
  skipPendingLabel = "가입 중",
  showArrow = false,
  stepLabel,
  isPending = false,
  pendingIntent,
  children,
}: {
  showBack?: boolean;
  showSkip?: boolean;
  submitLabel: string;
  submitPendingLabel: string;
  skipPendingLabel?: string;
  showArrow?: boolean;
  stepLabel?: string;
  isPending?: boolean;
  pendingIntent?: SignupIntent;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex min-h-[357px] w-full flex-col gap-6">{children}</div>
      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full gap-3">
          {showBack ? (
            <SignupSubmitButton
              intent="back"
              label="이전"
              pendingLabel="이동 중"
              variant="outline"
              className={backClassName}
              isPending={isPending}
              pendingIntent={pendingIntent}
            />
          ) : (
            <button
              type="button"
              disabled
              className="h-14 w-[104px] shrink-0 rounded-[12px] border border-[#e5e7eb] bg-[#f9fafb] text-[16px] font-semibold text-[#9ca3af]"
            >
              이전
            </button>
          )}
          <SignupSubmitButton
            intent="next"
            label={submitLabel}
            pendingLabel={submitPendingLabel}
            className={nextClassName}
            isPending={isPending}
            pendingIntent={pendingIntent}
            icon={
              showArrow ? (
                <img
                  src="/signup/arrow-right.svg"
                  alt=""
                  width={18}
                  height={18}
                  className="h-[18px] w-[18px] max-w-none"
                />
              ) : undefined
            }
          />
        </div>
        {showSkip ? (
          <SignupSubmitButton
            intent="skip"
            label="건너뛰고 가입 완료"
            pendingLabel={skipPendingLabel}
            variant="outline"
            className="h-6 w-full rounded-none border-0 bg-transparent px-0 text-[13px] font-normal text-[#6b7280] shadow-none hover:bg-transparent"
            isPending={isPending}
            pendingIntent={pendingIntent}
          />
        ) : (
          <p className="flex h-6 items-center justify-center text-[13px] leading-[normal] text-[#9ca3af]">
            {stepLabel}
          </p>
        )}
      </div>
    </div>
  );
}
