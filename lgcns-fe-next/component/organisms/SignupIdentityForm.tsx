import SignupIdField from "../molecules/SignupIdField";
import SignupStepActions from "../molecules/SignupStepActions";
import { submitSignupIdentity } from "@/actions/userActions";

export default function SignupIdentityForm({
  userId = "",
  errors = {},
}: {
  userId?: string;
  errors?: { userId?: string; form?: string };
}) {
  return (
    <SignupStepActions
      submitAction={submitSignupIdentity}
      submitLabel="다음"
      submitPendingLabel="확인 중"
      showArrow
      stepLabel="1 / 4 단계"
    >
      <div className="flex flex-col gap-[10px]">
        <h2 className="text-[22px] leading-[normal] font-bold text-[#111827]">아이디를 정해주세요</h2>
        <p className="text-[14px] leading-[1.6] text-[#6b7280]">로그인할 때 사용할 나만의 아이디예요.</p>
      </div>
      <SignupIdField defaultValue={userId} error={errors.userId} />
      {errors.form ? (
        <p className="text-[13px] text-red-500" role="alert">
          {errors.form}
        </p>
      ) : null}
    </SignupStepActions>
  );
}
