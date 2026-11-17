export default function SignupEmailNotice() {
  return (
    <div className="flex items-start gap-3 rounded-[10px] bg-[#f9fafb] p-4">
      <img
        src="/signup/mail.svg"
        alt=""
        width={18}
        height={18}
        className="h-[18px] w-[18px] max-w-none shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-[13px]">
        <p className="leading-[normal] font-semibold text-[#374151]">
          자주 사용하는 이메일을 입력해주세요
        </p>
        <p className="leading-[1.6] text-[#6b7280]">
          비밀번호를 잊었을 때 계정을 찾거나
          <br />
          중요한 안내를 받는 데 사용해요.
        </p>
      </div>
    </div>
  );
}
