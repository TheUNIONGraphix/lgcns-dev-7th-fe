import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { clearAccessToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useLoggedIn } from "@/components/providers/AuthGate";

const logoSrc =
  "https://www.lgcns.com/etc.clientlibs/lgcns/clientlibs/clientlib-site/resources/image/common/logo.svg";

const items = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/posts", label: "Posts" },
];

const linkClass = "text-[#111827] aria-[current=page]:font-semibold";

export default function SiteHeader() {
  const loggedIn = useLoggedIn();
  const { pathname } = useLocation();
  const [pending, setPending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const callbackUrl = pathname === "/login" || pathname === "/signup" ? "/" : pathname;

  const logout = () => {
    setPending(true);
    clearAccessToken();
    window.location.href = "/";
  };

  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-10 px-4 py-8">
      <h1>
        <a href="https://www.lgcns.com/" target="_blank" rel="noopener noreferrer">
          <img src={logoSrc} alt="logo" width={100} height={100} />
        </a>
        <span className="sr-only">LGCNS</span>
      </h1>
      <nav className="flex items-center" aria-label="Global">
        <button
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white md:hidden"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span className="sr-only">메뉴 열기</span>
          <svg className="h-6 w-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {menuOpen ? (
          <ul className="absolute top-24 left-4 flex flex-col gap-1 rounded-xl border border-[#e5e7eb] bg-white p-2 md:hidden">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  className="block rounded-lg px-3 py-3 text-base font-medium"
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        ) : null}
        <ul className="hidden items-center gap-4 md:flex">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink className={linkClass} to={item.to}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      {loggedIn ? (
        <Button
          type="button"
          variant="outline"
          onClick={logout}
          disabled={pending}
          aria-busy={pending}
        >
          {pending ? "로그아웃 중..." : "로그아웃"}
        </Button>
      ) : (
        <Button
          nativeButton={false}
          render={
            <NavLink to={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} />
          }
        >
          로그인
        </Button>
      )}
    </header>
  );
}
