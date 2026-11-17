import type { SignupIntent } from "@/actions/signupForm";
import { MAX_PROFILE_IMAGE_BYTES } from "@/schema/signupSchema";
import ErrorMessage from "../atoms/ErrorMessage";
import SignupPhotoInput from "../molecules/SignupPhotoInput";
import SignupStepActions from "../molecules/SignupStepActions";
import SignupStepIntro from "../molecules/SignupStepIntro";

export default function SignupProfileForm({
  errors,
  isPending = false,
  pendingIntent,
}: {
  errors: { profileImageUrl?: string; form?: string };
  isPending?: boolean;
  pendingIntent?: SignupIntent;
}) {
  return (
    <SignupStepActions
      showBack
      showSkip
      skipPendingLabel="가입 중"
      submitLabel="가입 완료"
      submitPendingLabel="가입 중"
      isPending={isPending}
      pendingIntent={pendingIntent}
    >
      <SignupStepIntro
        title="프로필을 꾸며보세요"
        badge="선택"
        description="나를 보여줄 사진을 등록해주세요. 나중에 설정해도 괜찮아요."
      />
      <SignupPhotoInput
        error={errors.profileImageUrl}
        maxBytes={MAX_PROFILE_IMAGE_BYTES}
      />
      {errors.form ? (
        <ErrorMessage
          id="signup-profile-error"
          error={errors.form}
          className="text-center text-[13px] text-red-500"
        />
      ) : null}
    </SignupStepActions>
  );
}
