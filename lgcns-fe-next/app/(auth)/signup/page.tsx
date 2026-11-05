import { Suspense } from "react";
import { submitSignup } from "@/actions/userActions";
import SignupSection from "@/component/templates/SignupSection";
import SignupFallback from "@/components/loader/SignupFallback";

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupSection action={submitSignup} />
    </Suspense>
  );
}
