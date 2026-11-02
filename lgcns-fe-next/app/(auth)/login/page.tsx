import { redirect } from "next/navigation";
import LoginSection from "@/component/templates/LoginSection";

export default function Login() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const userId = formData.get("userId");
    const password = formData.get("password");
    // student@example.com
    // api call
    // http://localhost:8080/api/v1/auth/login
    const baseUrl = "http://localhost:8080";
    const loginApiUrl = `${baseUrl}/api/v1/auth/login`;
    const response = await fetch(loginApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userId, password }),
    });
    const data = await response.json();
    console.log("data: ", data);
    console.log("userId: ", userId, "password: ", password);
    if (data.success) {
      redirect("/");
    }
  }

  return (
    <>
      {/* <LoginHeader /> */}
      <LoginSection handleSubmit={handleSubmit} />
      {/* <LoginFooter /> */}
    </>
  );
}