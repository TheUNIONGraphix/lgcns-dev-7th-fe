"use client";

import { createContext, useContext } from "react";

type AuthContextValue = {
  accessToken: string | null;
  isLoggedIn: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  accessToken: null,
  isLoggedIn: false,
});

export function AuthProvider({
  accessToken,
  children,
}: {
  accessToken: string | null;
  children: React.ReactNode;
}) {
  const value = {
    accessToken,
    isLoggedIn: Boolean(accessToken),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
