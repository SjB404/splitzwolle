import { API_BASE } from "../src/data/loginData.ts";

const ADMIN_API = `${API_BASE}/admin`;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api<T>(
  path: string,
  init: RequestInit = {},
  baseUrl = ADMIN_API,
): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let message = `Verzoek mislukt (${res.status})`;
    try {
      const body: { error?: unknown } = await res.json();
      if (typeof body.error === "string") message = body.error;
    } catch {
      // Keep the HTTP status message when the server does not return JSON.
    }
    throw new ApiError(message, res.status);
  }
  return res.json();
}
