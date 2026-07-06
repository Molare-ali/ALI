export async function parseApiError(response: Response) {
  try {
    const data = await response.json();
    if (data?.error) return String(data.error);
  } catch {
    // Fall through to the status-based message below.
  }
  return `Request failed with status ${response.status}.`;
}

export async function safeFetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return response.json() as Promise<T>;
}
