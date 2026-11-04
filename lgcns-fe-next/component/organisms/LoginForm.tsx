"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { signIn } from "next-auth/react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import ErrorMessage from "../atoms/ErrorMessage";
import FormField from "../molecules/FormField";
import initialValues from "@/types/initial/loginInitial";
import { UserPayloadType } from "@/types/request/RequestType";
import { emptyErrors } from "@/types/error/loginError";
import loginSchema, { loginFieldMessage } from "@/schema/loginSchema";

const SAVED_USER_ID_KEY = "lgcns-saved-user-id";

function subscribeSavedUserId() {
  return () => {};
}

function readSavedUserId() {
  return window.localStorage.getItem(SAVED_USER_ID_KEY) ?? "";
}

function readSavedUserIdOnServer() {
  return "";
}

type LoginFieldName = keyof UserPayloadType;

const inputClassName =
  "h-[52px] rounded-[10px] border-[#d1d5db] bg-white px-4 text-[15px] leading-[normal] text-[#111827] shadow-none placeholder:text-[#9ca3af] focus-visible:border-[#2563eb] focus-visible:ring-[#2563eb]/20 md:text-[15px]";

const fieldErrorClassName = "py-1 text-[12px] leading-[normal] text-red-500";

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const savedUserId = useSyncExternalStore(subscribeSavedUserId, readSavedUserId, readSavedUserIdOnServer);
  const [userId, setUserId] = useState<string | null>(null);
  const [password, setPassword] = useState(initialValues.password);
  const [rememberChoice, setRememberChoice] = useState<boolean | null>(null);
  const payload: UserPayloadType = {
    userId: userId ?? savedUserId,
    password,
  };
  const rememberId = rememberChoice ?? savedUserId.length > 0;
  const [errors, setErrors] = useState(emptyErrors);
  const [formError, setFormError] = useState("");
  const isValid = loginSchema.safeParse(payload).success;
  const [isPending, startTransition] = useTransition();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name !== "userId" && name !== "password") return;
    const field: LoginFieldName = name;
    if (field === "userId") setUserId(value);
    else setPassword(value);
    setErrors((current) => ({
      ...current,
      [field]: loginFieldMessage(field, value),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      setErrors({
        userId: loginFieldMessage("userId", payload.userId),
        password: loginFieldMessage("password", payload.password),
      });
      return;
    }

    if (rememberId) window.localStorage.setItem(SAVED_USER_ID_KEY, payload.userId);
    else window.localStorage.removeItem(SAVED_USER_ID_KEY);

    setFormError("");
    startTransition(async () => {
      await signIn("credentials", {
        email: payload.userId,
        password: payload.password,
        redirect: true,
        callbackUrl,
      });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="userId" className="text-[14px] font-medium leading-[normal] text-[#374151]">
            아이디
          </label>
          <FormField
            id="userId"
            type="text"
            name="userId"
            placeholder="아이디를 입력해주세요"
            value={payload.userId}
            error={errors.userId}
            autoComplete="username"
            required={false}
            inputClassName={inputClassName}
            collapseEmptyError
            errorClassName={fieldErrorClassName}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-[14px] font-medium leading-[normal] text-[#374151]">
            비밀번호
          </label>
          <FormField
            id="password"
            type="password"
            name="password"
            placeholder="비밀번호를 입력해주세요"
            value={payload.password}
            error={errors.password}
            autoComplete="current-password"
            required={false}
            showPasswordToggle
            inputClassName={inputClassName}
            collapseEmptyError
            errorClassName={fieldErrorClassName}
            onChange={handleChange}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <span className="relative size-5 shrink-0">
              <input
                type="checkbox"
                checked={rememberId}
                onChange={(event) => setRememberChoice(event.target.checked)}
                className="peer size-5 appearance-none rounded-[6px] border border-[#d1d5db] bg-white checked:border-[#2563eb] checked:bg-[#2563eb] transition-all duration-200"
              />
              <Check
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 hidden size-3.5 -translate-x-1/2 -translate-y-1/2 text-white peer-checked:block"
                strokeWidth={3}
              />
            </span>
            <span className="text-[14px] leading-[normal] whitespace-nowrap text-[#4b5563]">아이디 저장하기</span>
          </label>
          <button type="button" className="text-right text-[14px] leading-[normal] font-semibold whitespace-nowrap text-[#2563eb]">
            비밀번호 찾기 / 아이디 찾기
          </button>
        </div>
      </div>
      {formError ? <ErrorMessage id="login-error" error={formError} className={fieldErrorClassName} /> : null}
      <Button
        type="submit"
        aria-busy={isPending}
        className="h-14 w-full rounded-[12px] bg-[#2563eb] text-[16px] font-semibold leading-[normal] text-white shadow-[0px_4px_6px_rgba(37,99,235,0.2)] hover:bg-[#1d4ed8]"
      >
        {isPending ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
