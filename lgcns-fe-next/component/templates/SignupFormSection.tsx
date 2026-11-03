import { Form } from "@base-ui/react/form";
import SignupIdentityForm from "../organisms/SignupIdentityForm";

export default function SignUpFormSection({
  step,
  handleSignup,
}: {
  step: number;
  handleSignup: (formData: FormData) => void;
}) {


  return (
    <Form
      className="relative mx-auto flex h-screen w-full max-w-md flex-col gap-4 px-4 py-8"
      aria-labelledby="signup-title"
      id="signup-form"
    >
      <h2 id="signup-title" className="text-xl font-semibold">
        회원가입
      </h2>
      { step === 1? <SignupIdentityForm /> : null}
    </Form>
  );
}
