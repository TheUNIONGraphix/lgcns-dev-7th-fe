"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

const inputClassName =
  "h-[52px] rounded-[10px] border-[#d1d5db] bg-white px-4 pr-11 text-[15px] leading-[normal] text-[#111827] shadow-none placeholder:text-[#9ca3af] focus-visible:border-[#2563eb] focus-visible:ring-0 md:text-[15px]";

function strengthScore(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8 && password.length <= 20) score += 1;
  if (/[A-Za-z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) && score === 2) score += 1;
  return score;
}

function PasswordInput({
  id,
  name,
  label,
  value,
  autoComplete,
  invalid,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  autoComplete: string;
  invalid?: boolean;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[14px] leading-[normal] font-medium text-[#374151]">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          required={false}
          aria-invalid={invalid}
          placeholder="비밀번호를 입력해주세요"
          className={`${inputClassName} ${invalid ? "border-red-500 focus-visible:border-red-500" : ""}`}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
          aria-pressed={visible}
          className="absolute top-1/2 right-4 -translate-y-1/2"
          onClick={() => setVisible((current) => !current)}
        >
          <img src="/signup/eye-off.svg" alt="" width={18} height={18} className="h-[18px] w-[18px] max-w-none" />
        </button>
      </div>
    </div>
  );
}

export default function SignupPasswordFields({
  defaultPassword = "",
  passwordError = "",
  confirmError = "",
}: {
  defaultPassword?: string;
  passwordError?: string;
  confirmError?: string;
}) {
  const [password, setPassword] = useState(defaultPassword);
  const [confirm, setConfirm] = useState(defaultPassword);
  const [serverPasswordError, setServerPasswordError] = useState(passwordError);
  const [serverConfirmError, setServerConfirmError] = useState(confirmError);
  const score = strengthScore(password);
  const matches = password.length > 0 && password === confirm;
  const passwordMessage = password === defaultPassword ? serverPasswordError : "";
  const confirmMessage = confirm === defaultPassword && password === defaultPassword ? serverConfirmError : "";

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-[10px]">
        <PasswordInput
          id="password"
          name="password"
          label="비밀번호"
          value={password}
          autoComplete="new-password"
          invalid={Boolean(passwordMessage)}
          onChange={(value) => {
            setServerPasswordError("");
            setPassword(value);
          }}
        />
        <div className="flex items-center gap-2">
          <span className="flex w-20 gap-1" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className={`h-1 min-w-0 flex-1 rounded-full ${index < score ? "bg-[#2563eb]" : "bg-[#e5e7eb]"}`}
              />
            ))}
          </span>
          {score === 3 ? <span className="text-[12px] leading-[normal] text-[#2563eb]">안전한 비밀번호</span> : null}
        </div>
        {passwordMessage ? (
          <p className="text-[12px] leading-[normal] text-red-500" role="alert">
            {passwordMessage}
          </p>
        ) : (
          <p className="text-[12px] leading-[normal] text-[#6b7280]">영문, 숫자, 특수문자를 포함한 8~20자</p>
        )}
      </div>
      <div className="flex flex-col gap-[10px]">
        <PasswordInput
          id="passwordConfirm"
          name="passwordConfirm"
          label="비밀번호 확인"
          value={confirm}
          autoComplete="new-password"
          invalid={Boolean(confirmMessage) || (confirm.length > 0 && !matches)}
          onChange={(value) => {
            setServerConfirmError("");
            setConfirm(value);
          }}
        />
        {matches && !confirmMessage ? (
          <p className="flex items-center gap-2 text-[13px] leading-[1.5] text-[#2563eb]">
            <img src="/signup/check-16.svg" alt="" width={16} height={16} className="h-4 w-4 max-w-none" />
            비밀번호가 일치해요.
          </p>
        ) : null}
        {!matches && confirm.length > 0 ? (
          <p className="text-[13px] leading-[1.5] text-red-500" role="alert">
            비밀번호가 일치하지 않아요.
          </p>
        ) : null}
        {confirmMessage && matches ? (
          <p className="text-[13px] leading-[1.5] text-red-500" role="alert">
            {confirmMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
