import Link from "next/link";
import { Header, Section } from "@/components/ui/landmark";
import LoginForm from "../organisms/LoginForm";
import KakaoLoginButton from "../molecules/KakaoLoginButton";
import GoogleLoginButton from "../molecules/GoogleLoginButton";

export default function LoginSection() {
  return (
    <Section className="flex min-h-dvh flex-1 items-center justify-center bg-[#f3f4f6] px-4 py-10">
      <div className="flex w-full max-w-[484px] flex-col items-center gap-6 rounded-[24px] border border-[#e5e7eb] bg-white px-8 pt-[72px] pb-12 shadow-[0px_12px_16px_rgba(0,0,0,0.08)] min-[480px]:px-12">
        <Header className="flex w-full flex-col items-center gap-2 text-center">
          <h1 className="!font-sans text-[28px] leading-[normal] font-bold text-[#111827]">
            로그인
          </h1>
          <p className="text-[14px] leading-[normal] text-[#6b7280]">
            계정으로 로그인해주세요
          </p>
        </Header>
        <LoginForm />
        <div className="flex w-full items-center gap-4">
          <span className="h-px flex-1 bg-[#e5e7eb]" />
          <span className="text-[12px] leading-[normal] text-[#9ca3af]">
            또는
          </span>
          <span className="h-px flex-1 bg-[#e5e7eb]" />
        </div>
        <div className="flex w-full flex-col gap-3">
          <GoogleLoginButton />
          <KakaoLoginButton />
        </div>
        <p className="pt-6 text-center text-[14px] leading-[normal] text-[#6b7280]">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-semibold text-[#2563eb]">
            회원가입
          </Link>
        </p>
      </div>
    </Section>
  );
}
