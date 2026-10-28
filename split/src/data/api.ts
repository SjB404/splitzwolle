// one place for talking to the express api (backend/), used by the navbar and the reviews

import { API_BASE } from "./loginData.ts";

export interface ApiResult<T> {
  // 0 means the server could not be reached at all
  status: number;
  data: T | null;
}

export async function apiRequest<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: unknown } = {},
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? "GET",
      headers: options.body
        ? { "Content-Type": "application/json" }
        : undefined,
      // the login token is an http-only cookie, so it has to be sent along
      credentials: "include",
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = (await res.json().catch(() => null)) as T | null;
    return { status: res.status, data };
  } catch {
    return { status: 0, data: null };
  }
}

export function isOk(result: ApiResult<unknown>): boolean {
  return result.status >= 200 && result.status < 300;
}
