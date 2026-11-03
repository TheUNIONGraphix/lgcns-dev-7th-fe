import ErrorMessage from "../atoms/ErrorMessage";
import FormField from "../molecules/FormField";
import SignupStepActions from "../molecules/SignupStepActions";
import { skipSignupInterests, submitSignupInterests } from "@/app/(auth)/signup/actions";

const FORM_ID = "signup-interests-form";

export default function SignupInterestsForm({
  interests,
  errors,
}: {
  interests: string;
  errors: { interests?: string; form?: string };
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        관심사는 선택입니다. 쉼표로 여러 개를 적을 수 있고, 건너뛸 수 있습니다.
      </p>
      <div className="flex flex-col gap-1">
        <label htmlFor="interests" className="text-sm font-medium">
          관심사
        </label>
        <FormField
          id="interests"
          type="text"
          name="interests"
          form={FORM_ID}
          placeholder="예: 클라우드, 데이터, 보안"
          defaultValue={interests}
          error={errors.interests}
          isClearable
          required={false}
          autoComplete="off"
        />
      </div>
      <ErrorMessage id="signup-error" error={errors.form} />
      <SignupStepActions
        backStep={2}
        skipAction={skipSignupInterests}
        submitFormId={FORM_ID}
        submitAction={submitSignupInterests}
        submitLabel="다음"
        submitPendingLabel="확인 중"
      />
    </div>
  );
}
