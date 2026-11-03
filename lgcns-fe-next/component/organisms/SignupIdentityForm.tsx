import CustomTitle from "../atoms/CustomTitle";
import ErrorMessage from "../atoms/ErrorMessage";
import FormField from "../molecules/FormField";
import SignupStepActions from "../molecules/SignupStepActions";
import { submitSignupIdentity } from "@/actions/userActions";

export default function SignupIdentityForm({
  userId = "",
  email = "",
  errors = {},
}: {
  userId?: string;
  email?: string;
  errors?: { userId?: string; email?: string; form?: string };
}) {
  return (
    <SignupStepActions submitAction={submitSignupIdentity} submitLabel="다음" submitPendingLabel="확인 중">
      <CustomTitle TitleType="h2">아이디를 입력해주세요.</CustomTitle>
      <div className="flex flex-col gap-1">
        <label htmlFor="userId" className="text-sm font-medium">
          아이디
        </label>
        <FormField
          id="userId"
          type="text"
          name="userId"
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
          placeholder="이메일"
          defaultValue={email}
          error={errors.email}
          isClearable
          required={false}
          autoComplete="email"
        />
      </div>
      <ErrorMessage id="signup-identity-error" error={errors.form} />
    </SignupStepActions>
  );
}
