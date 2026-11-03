"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { interestsFromText, signupPasswordSchema } from "@/schema/signupSchema";
import { checkSignupIdentity, createSignup } from "@/app/(auth)/signup/actions";
import ErrorMessage from "../atoms/ErrorMessage";
import FormField from "../molecules/FormField";
import SignupProgress, { type SignupStep } from "../molecules/SignupProgress";

const emptyErrors = {
  userId: "",
  email: "",
  password: "",
  interests: "",
  profileImageUrl: "",
  form: "",
};

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  );
}

function stepClass(active: boolean) {
  return active ? "flex flex-col gap-1" : "hidden";
}

export default function SignupFields() {
  const [step, setStep] = useState<SignupStep>(1);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [interests, setInterests] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [errors, setErrors] = useState(emptyErrors);
  const [pending, setPending] = useState(false);
  const [readingImage, setReadingImage] = useState(false);
  const pendingRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const busy = pending || readingImage;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "userId") setUserId(value);
    else if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
    else if (name === "interests") setInterests(value);
    else return;
    setErrors((current) => ({ ...current, [name]: "", form: "" }));
  };

  const handleNext = async () => {
    if (pendingRef.current) return;

    if (step === 1) {
      pendingRef.current = true;
      setPending(true);
      setErrors((current) => ({ ...current, form: "", userId: "", email: "" }));
      try {
        const result = await checkSignupIdentity({ userId, email });
        if (!result.ok) {
          setErrors((current) => ({
            ...current,
            userId: result.userIdError,
            email: result.emailError,
            form: "message" in result ? (result.message ?? "") : "",
          }));
          return;
        }
        setStep(2);
      } catch {
        setErrors((current) => ({
          ...current,
          form: "중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        }));
      } finally {
        pendingRef.current = false;
        setPending(false);
      }
      return;
    }

    if (step === 2) {
      const parsed = signupPasswordSchema.safeParse(password);
      if (!parsed.success) {
        setErrors((current) => ({
          ...current,
          password: parsed.error.issues[0]?.message ?? "비밀번호는 8자 이상이어야 합니다.",
        }));
        return;
      }
      setErrors((current) => ({ ...current, password: "" }));
      setStep(3);
      return;
    }

    const parsedInterests = interestsFromText(interests);
    if (!parsedInterests.ok) {
      setErrors((current) => ({ ...current, interests: parsedInterests.message }));
      return;
    }
    setErrors((current) => ({ ...current, interests: "" }));
    setStep(4);
  };

  const finish = async (form: HTMLFormElement, skipImage: boolean) => {
    if (pendingRef.current || readingImage) return;
    pendingRef.current = true;
    setPending(true);
    setErrors((current) => ({ ...current, form: "", profileImageUrl: "" }));
    const formData = new FormData(form);
    if (skipImage) formData.set("profileImageUrl", "");
    try {
      const result = await createSignup(formData);
      if (result?.ok === false) {
        setErrors((current) => ({ ...current, form: result.message }));
      }
    } catch (error) {
      if (isNextRedirect(error)) throw error;
      setErrors((current) => ({ ...current, form: "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요." }));
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  };

  const handleSkip = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (busy) return;
    if (step === 3) {
      setInterests("");
      setErrors((current) => ({ ...current, interests: "", form: "" }));
      setStep(4);
      return;
    }
    const form = event.currentTarget.form;
    if (form) void finish(form, true);
  };

  const handleCreate = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const form = event.currentTarget.form;
    if (form) void finish(form, false);
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProfileImageUrl("");
      setErrors((current) => ({ ...current, profileImageUrl: "" }));
      return;
    }
    if (!IMAGE_TYPES.includes(file.type)) {
      event.target.value = "";
      setProfileImageUrl("");
      setErrors((current) => ({
        ...current,
        profileImageUrl: "PNG, JPEG, GIF, WEBP 이미지만 등록할 수 있습니다.",
      }));
      return;
    }
    if (file.size > 500 * 1024) {
      event.target.value = "";
      setProfileImageUrl("");
      setErrors((current) => ({
        ...current,
        profileImageUrl: "프로필 사진은 500KB 이하로 등록해 주세요.",
      }));
      return;
    }

    const reader = new FileReader();
    setReadingImage(true);
    reader.onload = () => {
      setReadingImage(false);
      setProfileImageUrl(typeof reader.result === "string" ? reader.result : "");
      setErrors((current) => ({ ...current, profileImageUrl: "" }));
    };
    reader.onerror = () => {
      setReadingImage(false);
      setProfileImageUrl("");
      setErrors((current) => ({ ...current, profileImageUrl: "프로필 사진을 읽지 못했습니다." }));
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setProfileImageUrl("");
    setErrors((current) => ({ ...current, profileImageUrl: "" }));
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <SignupProgress current={step} />
      <input type="hidden" name="profileImageUrl" value={profileImageUrl} />

      <div className={stepClass(step === 1)}>
        <p className="text-sm text-muted-foreground">아이디와 이메일을 입력해 주세요. 비어 있거나 이미 등록되어 있으면 다음으로 갈 수 없습니다.</p>
        <label htmlFor="userId" className="text-sm font-medium">
          아이디
        </label>
        <FormField
          id="userId"
          type="text"
          name="userId"
          placeholder="아이디"
          value={userId}
          error={errors.userId}
          isClearable
          autoComplete="username"
          onChange={handleChange}
        />
        <label htmlFor="email" className="text-sm font-medium">
          이메일
        </label>
        <FormField
          id="email"
          type="email"
          name="email"
          placeholder="이메일"
          value={email}
          error={errors.email}
          isClearable
          autoComplete="email"
          onChange={handleChange}
        />
      </div>

      <div className={stepClass(step === 2)}>
        <p className="text-sm text-muted-foreground">비밀번호는 8자 이상이어야 합니다.</p>
        <label htmlFor="password" className="text-sm font-medium">
          비밀번호
        </label>
        <FormField
          id="password"
          type="password"
          name="password"
          placeholder="비밀번호"
          value={password}
          error={errors.password}
          isClearable
          autoComplete="new-password"
          onChange={handleChange}
        />
      </div>

      <div className={stepClass(step === 3)}>
        <p className="text-sm text-muted-foreground">관심사는 선택입니다. 쉼표로 여러 개를 적을 수 있고, 건너뛸 수 있습니다.</p>
        <label htmlFor="interests" className="text-sm font-medium">
          관심사
        </label>
        <Input
          id="interests"
          name="interests"
          type="text"
          placeholder="예: 클라우드, 데이터, 보안"
          value={interests}
          autoComplete="off"
          aria-invalid={Boolean(errors.interests)}
          aria-describedby={errors.interests ? "interests-error" : undefined}
          onChange={handleChange}
        />
        <ErrorMessage id="interests-error" error={errors.interests} />
      </div>

      <div className={step === 4 ? "flex flex-col gap-2" : "hidden"}>
        <p className="text-sm text-muted-foreground">
          프로필 사진은 선택입니다. 500KB 이하의 PNG, JPEG, GIF, WEBP만 등록할 수 있고, 건너뛰면 사진 없이 가입합니다.
        </p>
        <label htmlFor="profileImage" className="text-sm font-medium">
          프로필 사진
        </label>
        <Input
          ref={fileRef}
          id="profileImage"
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          aria-invalid={Boolean(errors.profileImageUrl)}
          aria-describedby={errors.profileImageUrl ? "profileImage-error" : undefined}
          onChange={handleFile}
        />
        {readingImage ? <p className="text-sm text-muted-foreground">사진을 읽고 있습니다.</p> : null}
        {profileImageUrl ? (
          <img src={profileImageUrl} alt="선택한 프로필 사진 미리보기" className="size-24 rounded-full object-cover" />
        ) : null}
        {profileImageUrl ? (
          <Button type="button" variant="ghost" onClick={clearPhoto} disabled={busy}>
            사진 지우기
          </Button>
        ) : null}
        <ErrorMessage id="profileImage-error" error={errors.profileImageUrl} />
      </div>

      <ErrorMessage id="signup-error" error={errors.form} />

      <div className="flex flex-wrap gap-2">
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => setStep((current) => (current > 1 ? ((current - 1) as SignupStep) : current))}
          >
            이전
          </Button>
        ) : null}
        {step === 3 || step === 4 ? (
          <Button type="button" variant="outline" disabled={busy} onClick={handleSkip}>
            건너뛰기
          </Button>
        ) : null}
        {step < 4 ? (
          <Button type="button" disabled={busy} aria-busy={pending} onClick={() => void handleNext()}>
            {pending && step === 1 ? "확인 중" : "다음"}
          </Button>
        ) : (
          <Button type="submit" disabled={busy} aria-busy={pending} onClick={handleCreate}>
            {pending ? "가입 중" : "가입하기"}
          </Button>
        )}
      </div>
    </>
  );
}
