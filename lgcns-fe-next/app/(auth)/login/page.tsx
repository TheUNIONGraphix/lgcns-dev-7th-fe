import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { POST as login } from "@/app/api/auth/login/route";
import LoginSection from "@/component/templates/LoginSection";
import { ACCESS_TOKEN_COOKIE } from "@/component/providers/authCookie";

export default function Login() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const userId = formData.get("userId");
    const password = formData.get("password");
    if (typeof userId !== "string" || typeof password !== "string") redirect("/login");

    const response = await login(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userId, password }),
      }),
    );
    const data = await response.json();
    const accessToken = data?.data?.accessToken;
    if (!data.success || typeof accessToken !== "string") redirect("/login");

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

  return (
    <>
      {/* <LoginHeader /> */}
      <LoginSection handleSubmit={handleSubmit} />
      {/* <LoginFooter /> */}
    </>
  );
}