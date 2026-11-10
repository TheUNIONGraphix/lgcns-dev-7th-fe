import { type FormEvent, useState, useSyncExternalStore } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authOrigin } from "@/lib/env";
import { loginRequest, saveAccessToken } from "@/lib/auth";
import { safeCallbackPath } from "@/lib/routes";
import {
  authCard,
  authMain,
  errorText,
  fieldLabel,
  primaryButton,
  textInput,
} from "@/lib/ui";

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

function fieldMessage(field: "userId" | "password", value: string) {
  if (value) return "";
  return field === "userId"
    ? "아이디를 입력해 주세요."
    : "비밀번호를 입력해 주세요.";
}

function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const callbackUrl = safeCallbackPath(params.get("callbackUrl"));
  const savedUserId = useSyncExternalStore(
    subscribeSavedUserId,
    readSavedUserId,
    readSavedUserIdOnServer,
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [rememberChoice, setRememberChoice] = useState<boolean | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({ userId: "", password: "" });
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const idValue = userId ?? savedUserId;
  const rememberId = rememberChoice ?? savedUserId.length > 0;

  const startProvider = (provider: "google" | "kakao") => {
    const returnTo = `${window.location.origin}${callbackUrl}`;
    const handoff = `/api/auth/handoff?returnTo=${encodeURIComponent(returnTo)}`;
    window.location.href = `${authOrigin}/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(handoff)}`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = {
      userId: fieldMessage("userId", idValue),
      password: fieldMessage("password", password),
    };
    setErrors(nextErrors);
    if (nextErrors.userId || nextErrors.password || pending) return;

    if (rememberId) window.localStorage.setItem(SAVED_USER_ID_KEY, idValue);
    else window.localStorage.removeItem(SAVED_USER_ID_KEY);

    setPending(true);
    setFormError("");
    try {
      const result = await loginRequest(idValue, password);
      if (!result.ok) {
        setFormError(result.message);
        setPending(false);
        return;
      }
      saveAccessToken(result.accessToken);
      navigate(callbackUrl);
    } catch {
      setFormError("로그인 요청에 실패했습니다.");
      setPending(false);
    }
  };

  return (
    <main className={authMain}>
      <section className={authCard}>
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-[28px] font-bold text-[#111827]">로그인</h1>
          <p className="text-sm text-[#6b7280]">계정으로 로그인해주세요</p>
        </header>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className={fieldLabel} htmlFor="userId">
            아이디
            <input
              id="userId"
              className={textInput}
              name="userId"
              type="text"
              autoComplete="username"
              placeholder="아이디를 입력해주세요"
              value={idValue}
              onChange={(event) => {
                setUserId(event.target.value);
                setErrors((current) => ({
                  ...current,
                  userId: fieldMessage("userId", event.target.value),
                }));
              }}
            />
          </label>
          {errors.userId ? (
            <p className={errorText} role="alert">
              {errors.userId}
            </p>
          ) : null}
          <label className={fieldLabel} htmlFor="password">
            비밀번호
            <span className="flex items-center gap-2">
              <input
                id="password"
                className={textInput}
                name="password"
                type={passwordVisible ? "text" : "password"}
                autoComplete="current-password"
                placeholder="비밀번호를 입력해주세요"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((current) => ({
                    ...current,
                    password: fieldMessage("password", event.target.value),
                  }));
                }}
              />
              <button
                type="button"
                className="shrink-0 text-sm font-semibold text-[#374151]"
                aria-pressed={passwordVisible}
                aria-label={
                  passwordVisible ? "비밀번호 숨기기" : "비밀번호 보기"
                }
                onClick={() => setPasswordVisible((current) => !current)}
              >
                {passwordVisible ? "숨기기" : "보기"}
              </button>
            </span>
          </label>
          {errors.password ? (
            <p className={errorText} role="alert">
              {errors.password}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#4b5563]">
              <input
                className="size-5 rounded-md border border-[#d1d5db]"
                type="checkbox"
                checked={rememberId}
                onChange={(event) => setRememberChoice(event.target.checked)}
              />
              아이디 저장하기
            </label>
            <button
              type="button"
              className="text-sm font-semibold text-[#2563eb]"
            >
              비밀번호 찾기 / 아이디 찾기
            </button>
          </div>
          {formError ? (
            <p className={errorText} role="alert">
              {formError}
            </p>
          ) : null}
          <button
            className={`${primaryButton} w-full`}
            type="submit"
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? "로그인 중..." : "로그인"}
          </button>
        </form>
        <div className="flex items-center gap-4 text-xs text-[#9ca3af]">
          <span className="h-px flex-1 bg-[#e5e7eb]" />
          또는
          <span className="h-px flex-1 bg-[#e5e7eb]" />
        </div>
        <button
          type="button"
          className="h-14 w-full rounded-xl border border-[#d1d5db] bg-white text-[15px] font-semibold text-[#374151] hover:bg-[#f9fafb]"
          onClick={() => startProvider("google")}
        >
          구글로 로그인
        </button>
        <button
          type="button"
          className="h-14 w-full rounded-xl bg-[#fee500] text-[15px] font-semibold text-[#3a1d1d] hover:bg-[#f5dc00]"
          onClick={() => startProvider("kakao")}
        >
          카카오로 로그인
        </button>
        <p className="pt-2 text-center text-sm text-[#6b7280]">
          계정이 없으신가요?{" "}
          <Link className="font-semibold text-[#2563eb]" to="/signup">
            회원가입
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
