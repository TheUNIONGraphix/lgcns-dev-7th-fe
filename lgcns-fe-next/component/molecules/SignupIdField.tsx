"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

const USER_ID_PATTERN = /^[a-z0-9_]{4,20}$/;

const inputClassName =
  "h-[52px] rounded-[10px] bg-white px-4 pr-11 text-[15px] leading-[normal] text-[#111827] shadow-none placeholder:text-[#9ca3af] focus-visible:ring-0 md:text-[15px]";

export default function SignupIdField({
  defaultValue = "",
  error = "",
}: {
  defaultValue?: string;
  error?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [serverError, setServerError] = useState(error);
  const formatOk = USER_ID_PATTERN.test(value);
  const message = value === defaultValue ? serverError : "";
  const showSuccess = formatOk && !message;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="userId"
          className="text-[14px] leading-[normal] font-medium text-[#374151]"
        >
          아이디
        </label>
        <div className="relative">
          <Input
            id="userId"
            name="userId"
            type="text"
            value={value}
            autoComplete="username"
            required={false}
            aria-invalid={Boolean(message)}
            placeholder="아이디를 입력해주세요"
            className={`${inputClassName} ${
              message
                ? "border-red-500 focus-visible:border-red-500"
                : showSuccess
                  ? "border-[1.5px] border-[#2563eb] focus-visible:border-[#2563eb]"
                  : "border-[#d1d5db] focus-visible:border-[#2563eb]"
            }`}
            onChange={(event) => {
              setServerError("");
              setValue(event.target.value);
            }}
          />
          {showSuccess ? (
            <img
              src="/signup/check-18.svg"
              alt=""
              width={18}
              height={18}
              className="pointer-events-none absolute top-1/2 right-4 h-[18px] w-[18px] max-w-none -translate-y-1/2"
            />
          ) : null}
        </div>
      </div>
      {showSuccess ? (
        <p className="flex items-center gap-2 text-[13px] leading-[1.5] text-[#2563eb]">
          <img
            src="/signup/check-16.svg"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4 max-w-none"
          />
          사용할 수 있는 아이디예요.
        </p>
      ) : null}
      {message ? (
        <p className="text-[13px] leading-[1.5] text-red-500" role="alert">
          {message}
        </p>
      ) : null}
      <p className="text-[13px] leading-[1.6] text-[#6b7280]">
        영문 소문자, 숫자, 밑줄(_)을 조합해
        <br />
        4~20자로 입력해주세요.
      </p>
    </div>
  );
}
