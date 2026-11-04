import { Suspense } from "react";
import LoginSection from "@/component/templates/LoginSection";

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginSection />
    </Suspense>
  );
}
