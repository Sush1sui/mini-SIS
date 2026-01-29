function getApiBase() {
  if (typeof window !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_API_URL ||
      `${window.location.protocol}//${window.location.hostname}:4000`
    );
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
}

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const API = getApiBase();
  const url = path.startsWith("http") ? path : `${API}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw { status: res.status, ...data };
    return data;
  } catch (e) {
    // keep original error shape
    if (e instanceof SyntaxError) {
      if (!res.ok) throw { status: res.status, message: text };
      return text;
    }
    throw e;
  }
}

export default apiFetch;
