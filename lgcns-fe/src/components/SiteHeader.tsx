import { useState } from "react";
import { NavLink } from "react-router-dom";
import { clearAccessToken } from "../lib/auth";
import { outlineButton } from "../lib/ui";
import { useLoggedIn } from "./AuthGate";

const linkClass = "text-[#111827] aria-[current=page]:font-semibold";

export default function SiteHeader() {
  const loggedIn = useLoggedIn();
  const [pending, setPending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    setPending(true);
    clearAccessToken();
    window.location.href = "/";
  };

  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-10 px-4 py-8">
      <h1 className="text-2xl font-bold text-[#111827]">
        <a href="https://www.lgcns.com/" target="_blank" rel="noopener noreferrer">
          LGCNS
        </a>
      </h1>
      <nav className="flex items-center gap-4" aria-label="Global">
        <button
          type="button"
          className="md:hidden"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span className="sr-only">Open main menu</span>
          <svg className="h-6 w-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {menuOpen ? (
          <ul className="absolute top-24 left-4 flex flex-col gap-2 md:hidden">
            <li><NavLink className={linkClass} to="/">Home</NavLink></li>
          </ul>
        ) : null}
        <ul className="hidden items-center gap-4 md:flex">
          <li><NavLink className={linkClass} to="/">Home</NavLink></li>
          <li><NavLink className={linkClass} to="/about">About</NavLink></li>
          <li><NavLink className={linkClass} to="/contact">Contact</NavLink></li>
        </ul>
      </nav>
      {loggedIn ? (
        <button type="button" className={`${outlineButton} h-10 px-3 text-sm`} onClick={logout} disabled={pending} aria-busy={pending}>
          {pending ? "로그아웃 중..." : "로그아웃"}
        </button>
      ) : null}
    </header>
  );
}
