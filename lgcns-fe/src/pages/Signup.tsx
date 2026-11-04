import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiBaseUrl } from "../lib/env";
import { authCard, authMain, errorText, fieldLabel, outlineButton, primaryButton, textInput } from "../lib/ui";

const USER_ID_PATTERN = /^[a-z0-9_]{4,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DRAFT_KEY = "lgcns-signup-draft";
const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

type SignupStep = 1 | 2 | 3 | 4;

type Draft = {
  userId: string;
  password: string;
  email: string;
  userIdOk: boolean;
  passwordOk: boolean;
  emailOk: boolean;
  step: SignupStep;
};

const emptyDraft: Draft = {
  userId: "",
  password: "",
  email: "",
  userIdOk: false,
  passwordOk: false,
  emailOk: false,
  step: 1,
};

function asStep(value: unknown): SignupStep {
  if (value === 2 || value === 3 || value === 4) return value;
  return 1;
}

function readDraft(): Draft {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "") as Partial<Draft>;
    return {
      userId: typeof parsed.userId === "string" ? parsed.userId : "",
      password: typeof parsed.password === "string" ? parsed.password : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      userIdOk: parsed.userIdOk === true,
      passwordOk: parsed.passwordOk === true,
      emailOk: parsed.emailOk === true,
      step: asStep(parsed.step),
    };
  } catch {
    return emptyDraft;
  }
}

function furthestStep(draft: Draft) {
  if (!draft.userIdOk) return 1;
  if (!draft.passwordOk) return 2;
  if (!draft.emailOk) return 3;
  return 4;
}

function passwordOk(value: string) {
  return value.length >= 8 && value.length <= 20 && /[A-Za-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
}

function Signup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initial = readDraft();
  const rawStep = params.get("step");
  const requested = asStep(rawStep === null ? initial.step : Number(rawStep));
  const maxStep = furthestStep(initial);
  const [step, setStep] = useState<SignupStep>(requested > maxStep ? maxStep : requested);
  const [draft, setDraft] = useState(initial);
  const [confirm, setConfirm] = useState(initial.password);
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState({ password: false, confirm: false });

  const go = (next: SignupStep, nextDraft = draft) => {
    const saved = { ...nextDraft, step: next };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(saved));
    setDraft(saved);
    setStep(next);
    navigate(`/signup?step=${next}`, { replace: true });
  };

  const finish = async (includePhoto: boolean) => {
    setPending(true);
    setError("");
    let profileImageUrl: string | undefined;
    if (includePhoto && photo) {
      if (photo.type !== "image/png" && photo.type !== "image/jpeg") {
        setError("JPG, PNG 이미지만 등록할 수 있습니다.");
        setPending(false);
        return;
      }
      if (photo.size > MAX_PROFILE_IMAGE_BYTES) {
        setError("프로필 사진은 5MB 이하로 등록해 주세요.");
        setPending(false);
        return;
      }
      profileImageUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("프로필 사진을 읽지 못했습니다."));
        reader.readAsDataURL(photo);
      }).catch((caught: Error) => {
        setError(caught.message);
        return "";
      });
      if (!profileImageUrl) {
        setPending(false);
        return;
      }
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: draft.userId,
          email: draft.email,
          password: draft.password,
          interests: [],
          profileImageUrl,
        }),
      });
      const data = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !data.success) {
        const message = data.message || "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.";
        if (message.includes("아이디")) go(1, { ...draft, userIdOk: false });
        else if (message.includes("이메일")) go(3, { ...draft, emailOk: false });
        setError(message);
        setPending(false);
        return;
      }
      sessionStorage.removeItem(DRAFT_KEY);
      navigate("/login");
    } catch {
      setError("회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      setPending(false);
    }
  };

  return (
    <main className={authMain}>
      <section className={authCard}>
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-[28px] font-bold text-[#111827]">회원가입</h1>
          <p className="text-sm text-[#6b7280]">간단한 4단계로 계정을 만들어보세요</p>
        </header>
        <div className="flex w-full gap-2" aria-label="회원가입 4단계">
          {["아이디", "비밀번호", "이메일", "프로필"].map((label, index) => (
            <span key={label} className={index + 1 <= step ? "flex-1 text-center text-xs font-bold text-[#2563eb]" : "flex-1 text-center text-xs font-medium text-[#9ca3af]"}>{index + 1} {label}</span>
          ))}
        </div>
        {step === 1 ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-[22px] font-bold text-[#111827]">아이디를 정해주세요</h2>
            <p className="text-sm leading-relaxed text-[#6b7280]">로그인할 때 사용할 나만의 아이디예요.</p>
            <label className={fieldLabel} htmlFor="userId">아이디
              <input id="userId" className={textInput} value={draft.userId} autoComplete="username" placeholder="아이디를 입력해주세요" onChange={(event) => setDraft({ ...draft, userId: event.target.value, userIdOk: false })} />
            </label>
            <p className="text-[13px] leading-relaxed text-[#6b7280]">영문 소문자, 숫자, 밑줄(_)을 조합해 4~20자로 입력해주세요.</p>
            <div className="flex gap-3">
              <button className={`${outlineButton} w-[104px]`} type="button" disabled>이전</button>
              <button className={`${primaryButton} flex-1`} type="button" onClick={() => {
                const value = draft.userId.trim();
                if (!USER_ID_PATTERN.test(value)) {
                  setError("영문 소문자, 숫자, 밑줄(_)을 조합해 4~20자로 입력해주세요.");
                  return;
                }
                setError("");
                go(2, { ...draft, userId: value, userIdOk: true });
              }}>다음</button>
            </div>
            <p className="text-center text-[13px] text-[#9ca3af]">1 / 4 단계</p>
          </div>
        ) : null}
        {step === 2 ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-[22px] font-bold text-[#111827]">비밀번호를 설정해주세요</h2>
            <p className="text-sm leading-relaxed text-[#6b7280]">안전한 비밀번호로 계정을 보호하세요.</p>
            <label className={fieldLabel} htmlFor="password">비밀번호
              <span className="flex items-center gap-2">
                <input id="password" className={textInput} type={visible.password ? "text" : "password"} autoComplete="new-password" value={draft.password} placeholder="비밀번호를 입력해주세요" onChange={(event) => setDraft({ ...draft, password: event.target.value, passwordOk: false })} />
                <button className="shrink-0 text-sm font-semibold text-[#374151]" type="button" aria-pressed={visible.password} aria-label={visible.password ? "비밀번호 숨기기" : "비밀번호 보기"} onClick={() => setVisible((current) => ({ ...current, password: !current.password }))}>{visible.password ? "숨기기" : "보기"}</button>
              </span>
            </label>
            <p className="text-xs text-[#6b7280]">영문, 숫자, 특수문자를 포함한 8~20자</p>
            <label className={fieldLabel} htmlFor="passwordConfirm">비밀번호 확인
              <span className="flex items-center gap-2">
                <input id="passwordConfirm" className={textInput} type={visible.confirm ? "text" : "password"} autoComplete="new-password" value={confirm} placeholder="비밀번호를 입력해주세요" onChange={(event) => setConfirm(event.target.value)} />
                <button className="shrink-0 text-sm font-semibold text-[#374151]" type="button" aria-pressed={visible.confirm} aria-label={visible.confirm ? "비밀번호 숨기기" : "비밀번호 보기"} onClick={() => setVisible((current) => ({ ...current, confirm: !current.confirm }))}>{visible.confirm ? "숨기기" : "보기"}</button>
              </span>
            </label>
            <div className="flex gap-3">
              <button className={`${outlineButton} w-[104px]`} type="button" onClick={() => go(1)}>이전</button>
              <button className={`${primaryButton} flex-1`} type="button" onClick={() => {
                if (!passwordOk(draft.password)) {
                  setError("영문, 숫자, 특수문자를 포함한 8~20자로 입력해 주세요.");
                  return;
                }
                if (draft.password !== confirm) {
                  setError("비밀번호가 일치하지 않아요.");
                  return;
                }
                setError("");
                go(3, { ...draft, passwordOk: true });
              }}>다음</button>
            </div>
            <p className="text-center text-[13px] text-[#9ca3af]">2 / 4 단계</p>
          </div>
        ) : null}
        {step === 3 ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-[22px] font-bold text-[#111827]">이메일을 입력해주세요</h2>
            <p className="text-sm leading-relaxed text-[#6b7280]">계정에 연결할 이메일 주소를 알려주세요.</p>
            <label className={fieldLabel} htmlFor="email">이메일
              <input id="email" className={textInput} type="email" autoComplete="email" value={draft.email} placeholder="이메일을 입력해주세요" onChange={(event) => setDraft({ ...draft, email: event.target.value, emailOk: false })} />
            </label>
            <p className="rounded-[10px] bg-[#f9fafb] p-4 text-[13px] leading-relaxed text-[#6b7280]">자주 사용하는 이메일을 입력해주세요. 비밀번호를 잊었을 때 계정을 찾거나 중요한 안내를 받는 데 사용해요.</p>
            <div className="flex gap-3">
              <button className={`${outlineButton} w-[104px]`} type="button" onClick={() => go(2)}>이전</button>
              <button className={`${primaryButton} flex-1`} type="button" onClick={() => {
                const value = draft.email.trim();
                if (!value) {
                  setError("이메일을 입력해 주세요.");
                  return;
                }
                if (!EMAIL_PATTERN.test(value)) {
                  setError("이메일을 확인해 주세요.");
                  return;
                }
                setError("");
                go(4, { ...draft, email: value, emailOk: true });
              }}>다음</button>
            </div>
            <p className="text-center text-[13px] text-[#9ca3af]">3 / 4 단계</p>
          </div>
        ) : null}
        {step === 4 ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-[22px] font-bold text-[#111827]">프로필을 꾸며보세요 <span className="rounded-md bg-[#f3f4f6] px-2 py-1 text-[11px] font-medium text-[#6b7280]">선택</span></h2>
            <p className="text-sm leading-relaxed text-[#6b7280]">나를 보여줄 사진을 등록해주세요. 나중에 설정해도 괜찮아요.</p>
            <label className={fieldLabel} htmlFor="profileImage">이미지 업로드 / 변경
              <input id="profileImage" className="text-sm" type="file" accept="image/png,image/jpeg" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
            </label>
            <p className="text-center text-xs text-[#9ca3af]">JPG, PNG · 최대 5MB</p>
            <div className="flex gap-3">
              <button className={`${outlineButton} w-[104px]`} type="button" onClick={() => go(3)}>이전</button>
              <button className={`${primaryButton} flex-1`} type="button" disabled={pending} aria-busy={pending} onClick={() => finish(true)}>{pending ? "가입 중" : "가입 완료"}</button>
            </div>
            <button className="text-[13px] text-[#6b7280]" type="button" disabled={pending} onClick={() => finish(false)}>건너뛰고 가입 완료</button>
          </div>
        ) : null}
        {error ? <p className={errorText} role="alert">{error}</p> : null}
        <p className="text-center text-sm text-[#6b7280]">이미 계정이 있으신가요? <Link className="font-semibold text-[#2563eb]" to="/login">로그인</Link></p>
      </section>
    </main>
  );
}

export default Signup;
