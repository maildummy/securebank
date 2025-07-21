import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function parseErrorResponse(res: Response): Promise<string> {
  try {
    // Try to parse the error as JSON
    const errorData = await res.json();
    return errorData.message || `${res.status}: ${res.statusText}`;
  } catch (jsonError) {
    // If parsing fails, use status text
    return `${res.status}: ${res.statusText}`;
  }
}

// Helper function to ensure URLs are properly formed
function ensureAbsoluteUrl(url: string): string {
  // If the URL already starts with http(s), it's already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it starts with a slash, it's a path from the root
  if (url.startsWith('/')) {
    return `${window.location.origin}${url}`;
  }
  
  // Otherwise, assume it's a relative path
  return `${window.location.origin}/${url}`;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  customHeaders?: Record<string, string>
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  // Add content type if there's data
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add custom headers if provided
  if (customHeaders) {
    Object.keys(customHeaders).forEach(key => {
      // Convert X-Session-Id to Authorization Bearer if present
      if (key === 'X-Session-Id') {
        headers["Authorization"] = `Bearer ${customHeaders[key]}`;
      } else {
        headers[key] = customHeaders[key];
      }
    });
  }

  // Ensure we have an absolute URL
  const absoluteUrl = ensureAbsoluteUrl(url);
  
  console.log(`Making API request to: ${absoluteUrl}`);
  
  const res = await fetch(absoluteUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const errorMessage = await parseErrorResponse(res.clone());
    console.error(`API error (${res.status}):`, errorMessage);
    throw new Error(errorMessage);
  }

  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, meta }) => {
    const headers: Record<string, string> = {};
    
    // Add session ID to headers if available
    if (meta && meta.sessionId && typeof meta.sessionId === 'string') {
      headers["Authorization"] = `Bearer ${meta.sessionId}`;
    }
    
    // Ensure we have an absolute URL
    const absoluteUrl = ensureAbsoluteUrl(queryKey.join("/") as string);
    
    console.log(`Making query request to: ${absoluteUrl}`);
    
    const res = await fetch(absoluteUrl, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      const errorMessage = await parseErrorResponse(res.clone());
      console.error(`Query error (${res.status}):`, errorMessage);
      throw new Error(errorMessage);
    }

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
