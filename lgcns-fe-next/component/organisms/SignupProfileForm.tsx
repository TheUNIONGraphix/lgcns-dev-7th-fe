import SignupPhotoInput from "../molecules/SignupPhotoInput";
import SignupStepActions from "../molecules/SignupStepActions";
import { skipSignupProfile, submitSignupProfile } from "@/actions/userActions";

export default function SignupProfileForm({
  errors,
}: {
  errors: { profileImageUrl?: string; form?: string };
}) {
  return (
    <SignupStepActions
      backStep={3}
      skipAction={skipSignupProfile}
      skipPendingLabel="가입 중"
      submitAction={submitSignupProfile}
      submitLabel="가입 완료"
      submitPendingLabel="가입 중"
      encType="multipart/form-data"
    >
      <div className="flex flex-col gap-[10px]">
        <div className="flex items-center gap-2">
          <h2 className="text-[22px] leading-[normal] font-bold text-[#111827]">프로필을 꾸며보세요</h2>
          <span className="rounded-[6px] bg-[#f3f4f6] px-2 py-1 text-[11px] leading-[normal] font-medium text-[#6b7280]">
            선택
          </span>
        </div>
        <p className="text-[14px] leading-[1.6] text-[#6b7280]">
          나를 보여줄 사진을 등록해주세요. 나중에 설정해도 괜찮아요.
        </p>
      </div>
      <SignupPhotoInput error={errors.profileImageUrl} />
      {errors.form ? (
        <p className="text-center text-[13px] text-red-500" role="alert">
          {errors.form}
        </p>
      ) : null}
    </SignupStepActions>
  );
}
