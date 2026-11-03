import CustomTitle from "../atoms/CustomTitle";
import FormField from "../molecules/FormField";

export default function SignupIdentityForm() {
  return (
   <div>
      <CustomTitle TitleType="h2">
        아이디를 입력해주세요.
      </CustomTitle>
      <div className="flex flex-col gap-1">
        <label htmlFor="userId" className="text-sm font-medium">
          아이디
        </label>
        <FormField
          id="userId"
          type="text"
          name="userId"
          placeholder="아이디"
          isClearable
          required={false}
          autoComplete="username"
        />
      </div>
    </div>
  );
}
