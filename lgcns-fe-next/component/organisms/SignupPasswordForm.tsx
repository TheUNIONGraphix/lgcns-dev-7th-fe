import ErrorMessage from "../atoms/ErrorMessage";
import FormField from "../molecules/FormField";
import SignupStepActions from "../molecules/SignupStepActions";
import { submitSignupPassword } from "@/actions/userActions";

export default function SignupPasswordForm({
  password,
  errors,
}: {
  password: string;
  errors: { password?: string; form?: string };
}) {
  return (
    <SignupStepActions backStep={1} submitAction={submitSignupPassword} submitLabel="다음" submitPendingLabel="확인 중">
      <p className="text-sm text-muted-foreground">비밀번호는 8자 이상이어야 합니다.</p>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          비밀번호
        </label>
        <FormField
          id="password"
          type="password"
          name="password"
          placeholder="비밀번호"
          defaultValue={password}
          error={errors.password}
          isClearable
          required={false}
          autoComplete="new-password"
        />
      </div>
      <ErrorMessage id="signup-error" error={errors.form} />
    </SignupStepActions>
  );
}
