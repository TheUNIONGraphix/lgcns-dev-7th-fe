import SignupSection from "./SignupSection";
import type { SignupDraft, SignupErrors } from "@/actions/draft";

export default function SignUpFormSection({
  step,
  draft,
  errors,
}: {
  step: number;
  draft: SignupDraft;
  errors: SignupErrors;
}) {
  return <SignupSection step={step} draft={draft} errors={errors} />;
}
