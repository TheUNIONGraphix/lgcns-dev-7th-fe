import { Suspense } from "react";
import { markAllNotificationsRead, markNotificationRead } from "@/actions/notificationActions";
import Header from "@/component/templates/Header";
import { readNotificationSnapshot } from "@/lib/readNotificationSnapshot";

async function HeaderData() {
  const notifications = await readNotificationSnapshot();
  return (
    <Header
      notifications={notifications}
      markRead={markNotificationRead}
      markAll={markAllNotificationsRead}
    />
  );
}

export default function AppHeader() {
  return (
    <Suspense
      fallback={
        <Header
          notifications={null}
          markRead={markNotificationRead}
          markAll={markAllNotificationsRead}
        />
      }
    >
      <HeaderData />
    </Suspense>
  );
}
