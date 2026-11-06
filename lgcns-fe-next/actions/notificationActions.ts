"use server";

import { redirect } from "next/navigation";
import { readCurrentUser } from "@/lib/currentUser";
import { notificationService } from "@/service/notificationService";

function isObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}

export async function markNotificationRead(formData: FormData) {
  const user = await readCurrentUser();
  if (!user) return { ok: false as const };
  const notificationId = String(formData.get("notificationId") ?? "");
  const postId = String(formData.get("postId") ?? "");
  const result = await notificationService.markRead({
    userId: user.id,
    notificationId,
  });
  if (result.ok && isObjectId(postId)) redirect(`/postdetail/${postId}`);
  return result;
}

export async function markAllNotificationsRead() {
  const user = await readCurrentUser();
  if (!user) return { ok: false as const };
  return notificationService.markAllRead(user.id);
}
