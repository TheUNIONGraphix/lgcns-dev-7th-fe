import { Header as HeaderRoot } from "@/components/ui/landmark";
import Logo from "../organisms/Logo";
import GlobalNavigation from "../organisms/GlobaNavigation";
import NotificationMenu from "../organisms/NotificationMenu";
import LoginStatus from "../atoms/LoginStatus";
import type { NotificationSnapshot } from "@/types/notification";

type MarkRead = (formData: FormData) => Promise<{ ok: boolean }>;
type MarkAll = () => Promise<{ ok: boolean }>;

export default function Header({
  notifications,
  markRead,
  markAll,
}: {
  notifications: NotificationSnapshot | null;
  markRead: MarkRead;
  markAll: MarkAll;
}) {
  return (
    <HeaderRoot className="container mx-auto flex flex-row items-center justify-between gap-10 px-4 py-8">
      <Logo />
      <GlobalNavigation />
      <div className="flex items-center gap-3">
        <NotificationMenu notifications={notifications} markRead={markRead} markAll={markAll} />
        <LoginStatus />
      </div>
    </HeaderRoot>
  );
}
