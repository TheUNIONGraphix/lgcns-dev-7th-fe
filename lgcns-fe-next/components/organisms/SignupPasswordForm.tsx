import type { SignupIntent } from "@/actions/signupForm";
import SignupPasswordFields from "../molecules/SignupPasswordFields";
import SignupStepActions from "../molecules/SignupStepActions";

export default function SignupPasswordForm({
  password,
  passwordConfirm,
  errors,
  isPending = false,
  pendingIntent,
}: {
  password: string;
  passwordConfirm: string;
  errors: { password?: string; passwordConfirm?: string; form?: string };
  isPending?: boolean;
  pendingIntent?: SignupIntent;
}) {
  return (
    <SignupStepActions
      showBack
      submitLabel="다음"
      submitPendingLabel="확인 중"
      showArrow
      stepLabel="2 / 4 단계"
      isPending={isPending}
      pendingIntent={pendingIntent}
    >
      <div className="flex flex-col gap-[10px]">
        <h2 className="text-[22px] leading-[normal] font-bold text-[#111827]">
          비밀번호를 설정해주세요
        </h2>
        <p className="text-[14px] leading-[1.6] text-[#6b7280]">
          안전한 비밀번호로 계정을 보호하세요.
        </p>
      </div>
      <SignupPasswordFields
        defaultPassword={password}
        defaultConfirm={passwordConfirm}
        passwordError={errors.password}
        confirmError={errors.passwordConfirm}
      />
      {errors.form ? (
        <p className="text-[13px] text-red-500" role="alert">
          {errors.form}
        </p>
      ) : null}
    </SignupStepActions>
  );
}
