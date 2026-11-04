import SignupEmailField from "../molecules/SignupEmailField";
import SignupStepActions from "../molecules/SignupStepActions";
import { submitSignupEmail } from "@/actions/userActions";

export default function SignupEmailForm({
  email = "",
  errors = {},
}: {
  email?: string;
  errors?: { email?: string; form?: string };
}) {
  return (
    <SignupStepActions
      backStep={2}
      submitAction={submitSignupEmail}
      submitLabel="다음"
      submitPendingLabel="확인 중"
      showArrow
      stepLabel="3 / 4 단계"
    >
      <div className="flex flex-col gap-[10px]">
        <h2 className="text-[22px] leading-[normal] font-bold text-[#111827]">이메일을 입력해주세요</h2>
        <p className="text-[14px] leading-[1.6] text-[#6b7280]">계정에 연결할 이메일 주소를 알려주세요.</p>
      </div>
      <SignupEmailField defaultValue={email} error={errors.email} />
      {errors.form ? (
        <p className="text-[13px] text-red-500" role="alert">
          {errors.form}
        </p>
      ) : null}
      <div className="flex items-start gap-3 rounded-[10px] bg-[#f9fafb] p-4">
        <img src="/signup/mail.svg" alt="" width={18} height={18} className="h-[18px] w-[18px] max-w-none shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-[13px]">
          <p className="leading-[normal] font-semibold text-[#374151]">자주 사용하는 이메일을 입력해주세요</p>
          <p className="leading-[1.6] text-[#6b7280]">
            비밀번호를 잊었을 때 계정을 찾거나
            <br />
            중요한 안내를 받는 데 사용해요.
          </p>
        </div>
      </div>
    </SignupStepActions>
  );
}
