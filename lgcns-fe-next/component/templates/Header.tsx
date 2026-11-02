import Logo from "../organisms/Logo";
import GlobalNavigation from "../organisms/GlobaNavigation";
import LoginStatus from "../atoms/LoginStatus";

export default function Header(){
    return (
        <header className="container mx-auto flex flex-row justify-between items-center gap-10 px-4 py-8">
            <Logo />
            <GlobalNavigation />
            <LoginStatus />
        </header>
    );
}