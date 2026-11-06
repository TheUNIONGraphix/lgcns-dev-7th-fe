import { readCurrentUser } from "@/lib/currentUser";
import { notificationService } from "@/service/notificationService";
import type { NotificationSnapshot } from "@/types/notification";

export async function readNotificationSnapshot(): Promise<NotificationSnapshot | null> {
  const user = await readCurrentUser();
  if (!user) return null;
  return notificationService.listForUser(user.id);
}
