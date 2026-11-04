import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { readAccessToken } from "../lib/auth";
import { safeCallbackPath } from "../lib/routes";

function useLoggedIn() {
  const [loggedIn, setLoggedIn] = useState(() => {
    const token = readAccessToken();
    return typeof token === "string" && token.length > 0;
  });

  useEffect(() => {
    const sync = () => {
      const token = readAccessToken();
      setLoggedIn(typeof token === "string" && token.length > 0);
    };
    window.addEventListener("auth-change", sync);
    return () => window.removeEventListener("auth-change", sync);
  }, []);

  return loggedIn;
}

function MemberRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const loggedIn = useLoggedIn();
  if (!loggedIn) {
    const callback = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?callbackUrl=${encodeURIComponent(callback)}`} replace />;
  }
  return children;
}

function GuestRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const loggedIn = useLoggedIn();
  if (loggedIn) {
    const callbackUrl = new URLSearchParams(location.search).get("callbackUrl");
    return <Navigate to={safeCallbackPath(callbackUrl)} replace />;
  }
  return children;
}

export { GuestRoute, MemberRoute, useLoggedIn };
