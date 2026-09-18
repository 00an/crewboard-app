// utils/fetchWithAuth.ts

export function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  return fetch(input, {
    ...init,
    credentials: "include", // ✅ send httpOnly JWT cookie
    headers: {
      Accept: "application/json",
      ...(init.headers || {}),
    },
  });
}
