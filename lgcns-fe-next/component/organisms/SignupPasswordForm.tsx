import ErrorMessage from "../atoms/ErrorMessage";
import FormField from "../molecules/FormField";
import SignupStepActions from "../molecules/SignupStepActions";
import { submitSignupPassword } from "@/app/(auth)/signup/actions";

const FORM_ID = "signup-password-form";

export default function SignupPasswordForm({
  password,
  errors,
}: {
  password: string;
  errors: { password?: string; form?: string };
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">비밀번호는 8자 이상이어야 합니다.</p>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          비밀번호
        </label>
        <FormField
          id="password"
          type="password"
          name="password"
          form={FORM_ID}
          placeholder="비밀번호"
          defaultValue={password}
          error={errors.password}
          isClearable
          required={false}
          autoComplete="new-password"
        />
      </div>
      <ErrorMessage id="signup-error" error={errors.form} />
      <SignupStepActions
        backStep={1}
        submitFormId={FORM_ID}
        submitAction={submitSignupPassword}
        submitLabel="다음"
        submitPendingLabel="확인 중"
      />
    </div>
  );
}
