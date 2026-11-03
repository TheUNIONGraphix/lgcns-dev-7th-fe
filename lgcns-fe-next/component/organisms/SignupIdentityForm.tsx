"use client";
import ErrorMessage from "../atoms/ErrorMessage";
import FormField from "../molecules/FormField";
import SignupStepActions from "../molecules/SignupStepActions";
import { submitSignupIdentity } from "@/app/(auth)/signup/actions";

const FORM_ID = "signup-identity-form";

export default function SignupIdentityForm({
  userId,
  email,
  errors,
}: {
  userId: string;
  email: string;
  errors: { userId?: string; email?: string; form?: string };
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        아이디와 이메일을 입력해 주세요. 비어 있거나 이미 등록되어 있으면 다음으로 갈 수 없습니다.
      </p>
      <div className="flex flex-col gap-1">
        <label htmlFor="userId" className="text-sm font-medium">
          아이디
        </label>
        <FormField
          id="userId"
          type="text"
          name="userId"
          form={FORM_ID}
          placeholder="아이디"
          defaultValue={userId}
          error={errors.userId}
          isClearable
          required={false}
          autoComplete="username"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          이메일
        </label>
        <FormField
          id="email"
          type="email"
          name="email"
          form={FORM_ID}
          placeholder="이메일"
          defaultValue={email}
          error={errors.email}
          isClearable
          required={false}
          autoComplete="email"
        />
      </div>
      <ErrorMessage id="signup-error" error={errors.form} />
      <SignupStepActions
        submitFormId={FORM_ID}
        submitAction={submitSignupIdentity}
        submitLabel="다음"
        submitPendingLabel="확인 중"
      />
    </div>
  );
}
