import ErrorMessage from "../atoms/ErrorMessage";
import SignupPhotoInput from "../molecules/SignupPhotoInput";
import SignupStepActions from "../molecules/SignupStepActions";
import { skipSignupProfile, submitSignupProfile } from "@/app/(auth)/signup/actions";

const FORM_ID = "signup-profile-form";

export default function SignupProfileForm({
  errors,
}: {
  errors: { profileImageUrl?: string; form?: string };
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        프로필 사진은 선택입니다. 500KB 이하의 PNG, JPEG, GIF, WEBP만 등록할 수 있고, 건너뛰면 사진 없이 가입합니다.
      </p>
      <div className="flex flex-col gap-1">
        <label htmlFor="profileImage" className="text-sm font-medium">
          프로필 사진
        </label>
        <SignupPhotoInput form={FORM_ID} error={errors.profileImageUrl} />
      </div>
      <ErrorMessage id="signup-error" error={errors.form} />
      <SignupStepActions
        backStep={3}
        skipAction={skipSignupProfile}
        skipPendingLabel="가입 중"
        submitFormId={FORM_ID}
        submitAction={submitSignupProfile}
        submitLabel="가입하기"
        submitPendingLabel="가입 중"
        encType="multipart/form-data"
      />
    </div>
  );
}
