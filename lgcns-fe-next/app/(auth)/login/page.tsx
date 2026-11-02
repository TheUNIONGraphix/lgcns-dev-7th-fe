import LoginForm from "@/component/templates/LoginForm";

export default function Login() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const userId = formData.get("userId");
    const password = formData.get("password");
    console.log("userId: ", userId, "password: ", password);
  }

  return (
    <>
      {/* <LoginHeader /> */}
      <LoginForm handleSubmit={handleSubmit} />
      {/* <LoginFooter /> */}
    </>
  );
}