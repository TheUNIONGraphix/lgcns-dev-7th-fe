import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginSection from "@/component/templates/LoginSection";
import { ACCESS_TOKEN_COOKIE } from "@/component/providers/authCookie";

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
    const accessToken = data?.data?.accessToken;
    if (data.success && typeof accessToken === "string") {
      const cookieStore = await cookies();
      cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: typeof data.data?.expiresIn === "number" ? data.data.expiresIn : 60 * 60 * 2,
      });
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