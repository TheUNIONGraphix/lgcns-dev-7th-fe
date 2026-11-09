import type { SpringApiResponseType } from "@/types/response/springApiResponseType";

type QueryValue = string | number | boolean | null | undefined;

export type SpringRequest = {
  params?: Record<string, QueryValue>;
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeout?: number;
};

type SpringResult<T> = SpringApiResponseType<T | null>;

const CONNECT_FAILURE_MESSAGE = "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
const MISSING_BASE_MESSAGE = "API 주소가 설정되지 않았습니다.";

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function queryString(params?: Record<string, QueryValue>) {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    search.append(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

function buildUrl(baseUrl: string, path: string, params?: Record<string, QueryValue>) {
  const search = queryString(params);
  if (isAbsoluteUrl(path)) return `${path}${search}`;
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}${search}`;
}

function headerRecord(input?: HeadersInit): Record<string, string> {
  if (!input) return {};
  if (input instanceof Headers) return Object.fromEntries(input.entries());
  if (Array.isArray(input)) return Object.fromEntries(input);
  return { ...input };
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

function isSpringBody<T>(value: unknown): value is SpringApiResponseType<T | null> {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return typeof body.success === "boolean";
}

function toSpringBody<T>(value: unknown, status: number): SpringResult<T> | null {
  if (!isSpringBody<T>(value)) return null;
  return {
    success: value.success,
    code: typeof value.code === "number" ? value.code : status,
    message: typeof value.message === "string" ? value.message : "",
    data: value.data ?? null,
  };
}

async function readBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => undefined);
  }
  if (contentType.startsWith("text/")) return response.text();
  return undefined;
}

function failure<T>(code: number, message: string): SpringResult<T> {
  return { success: false, code, message, data: null };
}

export function createFetchClient(baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "") {
  async function request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    body?: unknown,
    options: SpringRequest = {},
  ): Promise<SpringResult<T>> {
    if (!baseUrl && !isAbsoluteUrl(path)) return failure(0, MISSING_BASE_MESSAGE);

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...headerRecord(options.headers),
    };
    const init: RequestInit = {
      method,
      headers,
      signal: options.signal,
    };

    if (body !== undefined && method !== "GET") {
      if (isFormData(body)) {
        init.body = body;
      } else {
        init.body = JSON.stringify(body);
        if (!headers["Content-Type"] && !headers["content-type"]) {
          init.headers = { ...headers, "Content-Type": "application/json" };
        }
      }
    }

    const timeout = options.timeout;
    const controller = new AbortController();
    const timer =
      timeout && timeout > 0
        ? setTimeout(() => controller.abort(), timeout)
        : undefined;
    if (options.signal) {
      options.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
    init.signal = controller.signal;

    try {
      const response = await fetch(buildUrl(baseUrl, path, options.params), init);
      const parsed = await readBody(response);
      const spring = toSpringBody<T>(parsed, response.status);
      if (spring) return spring;
      if (!response.ok) return failure(response.status, "요청에 실패했습니다.");
      return {
        success: true,
        code: response.status,
        message: "",
        data: (parsed ?? null) as T | null,
      };
    } catch {
      return failure(0, CONNECT_FAILURE_MESSAGE);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  return {
    get: <T>(path: string, options?: SpringRequest) => request<T>("GET", path, undefined, options),
    post: <T>(path: string, body?: unknown, options?: SpringRequest) =>
      request<T>("POST", path, body, options),
    put: <T>(path: string, body?: unknown, options?: SpringRequest) =>
      request<T>("PUT", path, body, options),
    patch: <T>(path: string, body?: unknown, options?: SpringRequest) =>
      request<T>("PATCH", path, body, options),
    delete: <T>(path: string, body?: unknown, options?: SpringRequest) =>
      request<T>("DELETE", path, body, options),
  };
}

export const springFetch = createFetchClient();
