"use client";

import { useState } from "react";
import type { SignupIntent } from "@/actions/signupForm";
import ErrorMessage from "../atoms/ErrorMessage";
import SignupCheckMessage from "../atoms/SignupCheckMessage";
import FormField from "../molecules/FormField";
import SignupEmailNotice from "../molecules/SignupEmailNotice";
import SignupStepActions from "../molecules/SignupStepActions";
import SignupStepIntro from "../molecules/SignupStepIntro";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClassName =
  "h-[52px] rounded-[10px] bg-white px-4 text-[15px] leading-[normal] text-[#111827] shadow-none placeholder:text-[#9ca3af] focus-visible:ring-0 md:text-[15px]";

const fieldErrorClassName = "py-1 text-[13px] leading-[1.5] text-red-500";

export default function SignupEmailForm({
  email = "",
  errors = {},
  seq = 0,
  isPending = false,
  pendingIntent,
}: {
  email?: string;
  errors?: { email?: string; form?: string };
  seq?: number;
  isPending?: boolean;
  pendingIntent?: SignupIntent;
}) {
  const [value, setValue] = useState(email);
  const [hideError, setHideError] = useState(false);
  const [seenSeq, setSeenSeq] = useState(seq);
  if (seenSeq !== seq) {
    setSeenSeq(seq);
    setValue(email);
    setHideError(false);
  }
  const message = hideError ? "" : (errors.email ?? "");
  const showSuccess = EMAIL_PATTERN.test(value) && !message;

  return (
    <SignupStepActions
      showBack
      submitLabel="다음"
      submitPendingLabel="확인 중"
      showArrow
      stepLabel="3 / 4 단계"
      isPending={isPending}
      pendingIntent={pendingIntent}
    >
      <SignupStepIntro
        title="이메일을 입력해주세요"
        description="계정에 연결할 이메일 주소를 알려주세요."
      />
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-[14px] leading-[normal] font-medium text-[#374151]"
          >
            이메일
          </label>
          <FormField
            id="email"
            name="email"
            type="email"
            placeholder="이메일을 입력해주세요"
            value={value}
            error={message}
            autoComplete="email"
            required={false}
            collapseEmptyError
            errorClassName={fieldErrorClassName}
            inputClassName={`${inputClassName} ${
              message
                ? "border-red-500 focus-visible:border-red-500"
                : showSuccess
                  ? "border-[1.5px] border-[#2563eb] focus-visible:border-[#2563eb]"
                  : "border-[#d1d5db] focus-visible:border-[#2563eb]"
            }`}
            onChange={(event) => {
              setHideError(true);
              setValue(event.target.value);
            }}
          />
        </div>
        {showSuccess ? (
          <SignupCheckMessage>올바른 이메일 형식이에요.</SignupCheckMessage>
        ) : null}
      </div>
      {errors.form ? (
        <ErrorMessage
          id="signup-email-error"
          error={errors.form}
          className="text-[13px] text-red-500"
        />
      ) : null}
      <SignupEmailNotice />
    </SignupStepActions>
  );
}
