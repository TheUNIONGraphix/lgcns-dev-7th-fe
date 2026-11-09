import { Suspense } from "react";
import { submitSignup } from "@/actions/userActions";
import SignupSection from "@/components/templates/SignupSection";
import SignupFallback from "@/components/loader/SignupFallback";

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupSection action={submitSignup} />
    </Suspense>
  );
}
