"use client";

import { useState } from "react";
import type { SignupIntent } from "@/actions/signupForm";
import ErrorMessage from "../atoms/ErrorMessage";
import SignupCheckMessage from "../atoms/SignupCheckMessage";
import FormField from "../molecules/FormField";
import SignupPasswordMeter from "../molecules/SignupPasswordMeter";
import SignupStepActions from "../molecules/SignupStepActions";
import SignupStepIntro from "../molecules/SignupStepIntro";

const inputClassName =
  "h-[52px] rounded-[10px] bg-white px-4 text-[15px] leading-[normal] text-[#111827] shadow-none placeholder:text-[#9ca3af] focus-visible:ring-0 md:text-[15px]";

const fieldErrorClassName = "py-1 text-[13px] leading-[1.5] text-red-500";

export default function SignupPasswordForm({
  password,
  passwordConfirm,
  errors,
  seq = 0,
  isPending = false,
  pendingIntent,
}: {
  password: string;
  passwordConfirm: string;
  errors: { password?: string; passwordConfirm?: string; form?: string };
  seq?: number;
  isPending?: boolean;
  pendingIntent?: SignupIntent;
}) {
  const [passwordValue, setPasswordValue] = useState(password);
  const [confirmValue, setConfirmValue] = useState(passwordConfirm);
  const [hidePasswordError, setHidePasswordError] = useState(false);
  const [hideConfirmError, setHideConfirmError] = useState(false);
  const [seenSeq, setSeenSeq] = useState(seq);
  if (seenSeq !== seq) {
    setSeenSeq(seq);
    setPasswordValue(password);
    setConfirmValue(passwordConfirm);
    setHidePasswordError(false);
    setHideConfirmError(false);
  }
  const passwordMessage = hidePasswordError ? "" : (errors.password ?? "");
  const serverConfirm = hideConfirmError ? "" : (errors.passwordConfirm ?? "");
  const matches = passwordValue.length > 0 && passwordValue === confirmValue;
  const confirmMessage =
    confirmValue.length > 0 && !matches
      ? "비밀번호가 일치하지 않아요."
      : matches
        ? serverConfirm
        : "";

  return (
    <SignupStepActions
      showBack
      submitLabel="다음"
      submitPendingLabel="확인 중"
      showArrow
      stepLabel="2 / 4 단계"
      isPending={isPending}
      pendingIntent={pendingIntent}
    >
      <SignupStepIntro
        title="비밀번호를 설정해주세요"
        description="안전한 비밀번호로 계정을 보호하세요."
      />
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-[14px] leading-[normal] font-medium text-[#374151]"
            >
              비밀번호
            </label>
            <FormField
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={passwordValue}
              error={passwordMessage}
              autoComplete="new-password"
              required={false}
              collapseEmptyError
              errorClassName={fieldErrorClassName}
              inputClassName={`${inputClassName} ${
                passwordMessage
                  ? "border-red-500 focus-visible:border-red-500"
                  : "border-[#d1d5db] focus-visible:border-[#2563eb]"
              }`}
              onChange={(event) => {
                setHidePasswordError(true);
                setPasswordValue(event.target.value);
              }}
            />
          </div>
          <SignupPasswordMeter password={passwordValue} />
          {passwordMessage ? null : (
            <p className="text-[12px] leading-[normal] text-[#6b7280]">
              영문, 숫자, 특수문자를 포함한 8~20자
            </p>
          )}
        </div>
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="passwordConfirm"
              className="text-[14px] leading-[normal] font-medium text-[#374151]"
            >
              비밀번호 확인
            </label>
            <FormField
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={confirmValue}
              error={confirmMessage}
              autoComplete="new-password"
              required={false}
              collapseEmptyError
              errorClassName={fieldErrorClassName}
              inputClassName={`${inputClassName} ${
                confirmMessage
                  ? "border-red-500 focus-visible:border-red-500"
                  : "border-[#d1d5db] focus-visible:border-[#2563eb]"
              }`}
              onChange={(event) => {
                setHideConfirmError(true);
                setConfirmValue(event.target.value);
              }}
            />
          </div>
          {matches && !serverConfirm ? (
            <SignupCheckMessage>비밀번호가 일치해요.</SignupCheckMessage>
          ) : null}
        </div>
      </div>
      {errors.form ? (
        <ErrorMessage
          id="signup-password-error"
          error={errors.form}
          className="text-[13px] text-red-500"
        />
      ) : null}
    </SignupStepActions>
  );
}
