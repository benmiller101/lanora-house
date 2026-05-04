import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  // Consider 201 Created as a successful response
  if (!res.ok && res.status !== 201) {
    try {
      // Clone the response to avoid "body stream already read" error
      const clonedRes = res.clone();
      const errorData = await clonedRes.json();
      if (errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error(JSON.stringify(errorData));
      }
    } catch (jsonError) {
      // If JSON parsing fails, fall back to text from original response
      try {
        const text = await res.text();
        throw new Error(text || res.statusText);
      } catch (textError) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  customHeaders?: Record<string, string>
): Promise<Response> {
  // Default headers
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(customHeaders || {})
  };
  
  // Get admin credentials from localStorage if they exist
  const adminEmail = localStorage.getItem("adminEmail");
  const adminPassword = localStorage.getItem("adminPassword");
  
  // Add admin authentication to protected routes if available
  if (adminEmail && adminPassword) {
    headers["Authorization"] = `Basic ${btoa(`${adminEmail}:${adminPassword}`)}`;
    console.log("Added admin auth headers");
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Build headers with admin auth if available
    const headers: Record<string, string> = {};
    
    // Get admin credentials from localStorage if they exist
    const adminEmail = localStorage.getItem("adminEmail");
    const adminPassword = localStorage.getItem("adminPassword");
    
    // Add admin authentication to protected routes if available
    if (adminEmail && adminPassword) {
      headers["Authorization"] = `Basic ${btoa(`${adminEmail}:${adminPassword}`)}`;
    }

    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
