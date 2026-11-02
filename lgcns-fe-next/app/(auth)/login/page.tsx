import LoginSection from "@/component/templates/LoginSection";

export default function Login() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const userId = formData.get("userId");
    const password = formData.get("password");
    // api call
    console.log("userId: ", userId, "password: ", password);
  }

  return (
    <>
      {/* <LoginHeader /> */}
      <LoginSection handleSubmit={handleSubmit} />
      {/* <LoginFooter /> */}
    </>
  );
}