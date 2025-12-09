// API client for frontend to call backend routes

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function fetcher<T>(
  url: string,
  options?: RequestInit,
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, data.error || "An error occurred")
  }

  return data
}

// Auth API functions
export const authApi = {
  login: async (email: string, password: string) => {
    return fetcher<{ user: any; token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  register: async (data: {
    name: string
    username: string
    email: string
    password: string
    userRole: string
  }) => {
    return fetcher<{ user: any; token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  verifyEmail: async (email: string) => {
    return fetcher<{ _dev_code?: string }>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  forgotPassword: async (email: string) => {
    return fetcher<{ _dev_code?: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    return fetcher("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword }),
    })
  },

  getCurrentUser: async (token: string) => {
    return fetcher<any>("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  logout: async () => {
    return fetcher("/api/auth/logout", {
      method: "POST",
    })
  },
}

// Storage for auth token
export const tokenStorage = {
  get: () => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("auth_token")
  },

  set: (token: string) => {
    if (typeof window === "undefined") return
    localStorage.setItem("auth_token", token)
  },

  remove: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem("auth_token")
  },
}
