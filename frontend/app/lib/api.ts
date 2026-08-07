const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type User = {
  id: string;
  email: string;
  full_name: string | null;
};

export type Generation = {
  id: string;
  generation_type: "product_scene" | "ad_creative";
  prompt: string;
  source_image_url: string | null;
  result_image_url: string | null;
  status: "pending" | "completed" | "failed";
  error_message: string | null;
  created_at: string;
};

type TokenResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(options.body instanceof FormData) && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      // ignore parse errors
    }
    throw new Error(detail);
  }

  return res.json();
}

export const api = {
  register: (email: string, password: string, full_name?: string) =>
    request<TokenResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    }),

  login: (email: string, password: string) =>
    request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/api/auth/me"),

  listGenerations: () => request<Generation[]>("/api/generations"),

  createGeneration: (params: {
    generation_type: "product_scene" | "ad_creative";
    prompt: string;
    sourceImage?: File | null;
  }) => {
    const form = new FormData();
    form.append("generation_type", params.generation_type);
    form.append("prompt", params.prompt);
    if (params.sourceImage) form.append("source_image", params.sourceImage);

    return request<Generation>("/api/generations", {
      method: "POST",
      body: form,
    });
  },
};

export { getToken };
