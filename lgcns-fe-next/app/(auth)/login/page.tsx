import { redirect } from "next/navigation";
import LoginSection from "@/component/templates/LoginSection";
import { readAccessToken } from "@/lib/readAccessToken";

export default async function Login() {
  if (await readAccessToken()) redirect("/");
  return <LoginSection />;
}
