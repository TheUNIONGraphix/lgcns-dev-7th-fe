"use client";

import { useState } from "react";
import type { SignupIntent } from "@/actions/signupForm";
import ErrorMessage from "../atoms/ErrorMessage";
import SignupCheckMessage from "../atoms/SignupCheckMessage";
import FormField from "../molecules/FormField";
import SignupStepActions from "../molecules/SignupStepActions";
import SignupStepIntro from "../molecules/SignupStepIntro";

const USER_ID_PATTERN = /^[a-z0-9_]{4,20}$/;

const inputClassName =
  "h-[52px] rounded-[10px] bg-white px-4 text-[15px] leading-[normal] text-[#111827] shadow-none placeholder:text-[#9ca3af] focus-visible:ring-0 md:text-[15px]";

const fieldErrorClassName = "py-1 text-[13px] leading-[1.5] text-red-500";

export default function SignupIdentityForm({
  userId = "",
  errors = {},
  seq = 0,
  isPending = false,
  pendingIntent,
}: {
  userId?: string;
  errors?: { userId?: string; form?: string };
  seq?: number;
  isPending?: boolean;
  pendingIntent?: SignupIntent;
}) {
  const [value, setValue] = useState(userId);
  const [hideError, setHideError] = useState(false);
  const [seenSeq, setSeenSeq] = useState(seq);
  if (seenSeq !== seq) {
    setSeenSeq(seq);
    setValue(userId);
    setHideError(false);
  }
  const message = hideError ? "" : (errors.userId ?? "");
  const showSuccess = USER_ID_PATTERN.test(value) && !message;

  return (
    <SignupStepActions
      submitLabel="다음"
      submitPendingLabel="확인 중"
      showArrow
      stepLabel="1 / 4 단계"
      isPending={isPending}
      pendingIntent={pendingIntent}
    >
      <SignupStepIntro
        title="아이디를 정해주세요"
        description="로그인할 때 사용할 나만의 아이디예요."
      />
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="userId"
            className="text-[14px] leading-[normal] font-medium text-[#374151]"
          >
            아이디
          </label>
          <FormField
            id="userId"
            name="userId"
            type="text"
            placeholder="아이디를 입력해주세요"
            value={value}
            error={message}
            autoComplete="username"
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
          <SignupCheckMessage>사용할 수 있는 아이디예요.</SignupCheckMessage>
        ) : null}
        <p className="text-[13px] leading-[1.6] text-[#6b7280]">
          영문 소문자, 숫자, 밑줄(_)을 조합해
          <br />
          4~20자로 입력해주세요.
        </p>
      </div>
      {errors.form ? (
        <ErrorMessage
          id="signup-identity-error"
          error={errors.form}
          className="text-[13px] text-red-500"
        />
      ) : null}
    </SignupStepActions>
  );
}
