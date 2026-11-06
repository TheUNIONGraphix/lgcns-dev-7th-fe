"use server";

import { redirect } from "next/navigation";
import { saveReturnTo } from "@/lib/returnToCookie";

export async function rememberReturnPath(formData: FormData) {
  const value = formData.get("returnTo");
  await saveReturnTo(typeof value === "string" ? value : "");
  redirect("/login");
}
