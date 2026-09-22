const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : "http://localhost:8000");

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
};

export type AdminDashboard = {
  users: number;
  active_users: number;
  generations: number;
  completed: number;
  failed: number;
  today_generations: number;
};

export type AdminUser = User & {
  created_at: string;
  generation_count: number;
};

export type AdminGeneration = Generation & {
  user_id: string;
  user_email: string;
};

export type Generation = {
  id: string;
  generation_type: "product_scene" | "ad_creative";
  prompt: string;
  source_image_url: string | null;
  result_image_url: string | null;
  status: "pending" | "completed" | "failed";
  error_message: string | null;
  is_public: boolean;
  created_at: string;
};

export type CommunityComment = {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
};

export type CommunityImage = {
  id: string;
  user_id: string;
  user_name: string;
  generation_type: string;
  prompt: string;
  result_image_url: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  save_count: number;
  liked: boolean;
  saved: boolean;
  comments?: CommunityComment[];
};

export type CommunityDetail = CommunityImage & { comments: CommunityComment[] };

type ToggleResult = { active: boolean; count: number };

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

  adminDashboard: () => request<AdminDashboard>("/api/admin/dashboard"),

  adminUsers: () => request<AdminUser[]>("/api/admin/users"),

  adminSetUserStatus: (id: string, isActive: boolean) =>
    request<{ message: string; is_active: boolean }>(`/api/admin/users/${id}/status?is_active=${isActive}`, {
      method: "PATCH",
    }),

  adminGenerations: () => request<AdminGeneration[]>("/api/admin/generations"),

  adminDeleteGeneration: (id: string) =>
    request<{ message: string }>(`/api/admin/generations/${id}`, { method: "DELETE" }),

  setGenerationVisibility: (id: string, isPublic: boolean) =>
    request<Generation>(`/api/generations/${id}/visibility?is_public=${isPublic}`, { method: "PATCH" }),

  communityImages: (sort: "newest" | "popular" = "newest") =>
    request<CommunityImage[]>(`/api/community?sort=${sort}`),

  communityImage: (id: string) => request<CommunityDetail>(`/api/community/${id}`),

  communityLike: (id: string) => request<ToggleResult>(`/api/community/${id}/like`, { method: "POST" }),

  communitySave: (id: string) => request<ToggleResult>(`/api/community/${id}/save`, { method: "POST" }),

  communityComment: (id: string, content: string) =>
    request<CommunityComment>(`/api/community/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  savedImages: () => request<CommunityImage[]>("/api/community/saved/list"),

  deleteGeneration: async (id: string) => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/generations/${id}`,
    {
      method: "DELETE",
      headers: {
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Delete failed");
  }

  return response.json();
},
}

export { getToken };
