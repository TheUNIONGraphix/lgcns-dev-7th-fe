import LoginForm from "../organisms/LoginForm";
import KakaoLoginButton from "../molecules/KakaoLoginButton";
import GoogleLoginButton from "../molecules/GoogleLoginButton";

export default function LoginSection() {
  return (
    <section>
      <LoginForm />
      {/* <KakaoLoginButton /> */}
      <GoogleLoginButton />
    </section>
  );
}
