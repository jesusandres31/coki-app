import { config } from "src/config";

export interface CustomFetchOptions extends RequestInit {
  auth?: boolean;
}

export async function customFetch(
  path: string,
  options: CustomFetchOptions = {},
): Promise<Response> {
  const url = `${config.API.URL}/${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(options.headers || {});
  if (options.auth) {
    const token = config.API.SECURITY_TOKEN;
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, {
    ...options,
    headers,
  });
}
