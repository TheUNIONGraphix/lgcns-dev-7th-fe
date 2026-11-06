import Logo from "../organisms/Logo";
import GlobalNavigation from "../organisms/GlobaNavigation";
import NotificationMenu from "../organisms/NotificationMenu";
import LoginStatus from "../atoms/LoginStatus";

export default function Header() {
  return (
    <header className="container mx-auto flex flex-row items-center justify-between gap-10 px-4 py-8">
      <Logo />
      <GlobalNavigation />
      <div className="flex items-center gap-3">
        <NotificationMenu />
        <LoginStatus />
      </div>
    </header>
  );
}
