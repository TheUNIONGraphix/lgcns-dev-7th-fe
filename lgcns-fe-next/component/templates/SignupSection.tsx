import SignupProgress from "../molecules/SignupProgress";
import SignupIdentityForm from "../organisms/SignupIdentityForm";
import SignupInterestsForm from "../organisms/SignupInterestsForm";
import SignupPasswordForm from "../organisms/SignupPasswordForm";
import SignupProfileForm from "../organisms/SignupProfileForm";

export default function SignupSection({
  step,
  handleSignup,
}: {
  step: number;
  handleSignup: (formData: FormData) => void;
}) {
  return (
    <section
      className="relative mx-auto flex h-screen w-full max-w-md flex-col gap-4 px-4 py-8"
      aria-labelledby="signup-title"
    >
      <h2 id="signup-title" className="text-xl font-semibold">
        회원가입
      </h2>
      <SignupProgress current={step} />
      {step === 1 ? <SignupIdentityForm userId={draft.userId} email={draft.email} errors={errors} /> : null}
      {step === 2 ? <SignupPasswordForm password={draft.password} errors={errors} /> : null}
      {step === 3 ? <SignupInterestsForm interests={draft.interestsText} errors={errors} /> : null}
      {step === 4 ? <SignupProfileForm errors={errors} /> : null}
    </section>
  );
}
