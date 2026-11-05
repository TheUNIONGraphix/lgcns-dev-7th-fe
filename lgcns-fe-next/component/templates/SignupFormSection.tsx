import SignupSection from "./SignupSection";
import type { SignupFormState } from "@/actions/signupForm";

type SignupAction = (
  state: SignupFormState,
  formData: FormData,
) => Promise<SignupFormState>;

export default function SignUpFormSection({ action }: { action: SignupAction }) {
  return <SignupSection action={action} />;
}
