// who is logged in, according to the api's /auth/me (the token itself is an http-only cookie)

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiRequest, isOk } from "./api.ts";

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

// checks again on every page change, so logging in or out on the login page shows up right away
export function useSessionUser(): SessionUser | null {
  const { pathname } = useLocation();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let current = true;

    apiRequest<{ user: SessionUser }>("/auth/me").then((result) => {
      if (current) setUser(isOk(result) ? (result.data?.user ?? null) : null);
    });

    return () => {
      current = false;
    };
  }, [pathname]);

  return user;
}

// "jan.devries@mail.nl" -> "JD", "piet@mail.nl" -> "PI"
export function userInitials(email: string): string {
  const name = email.split("@")[0];
  const parts = name.split(/[._-]+/).filter(Boolean);

  const initials =
    parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);

  return initials.toUpperCase();
}
