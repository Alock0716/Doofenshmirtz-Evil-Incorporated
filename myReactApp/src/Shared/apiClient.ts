const apiBaseUrl = "http://localhost:5000"

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

async function requestJson<T>(pathValue: string, optionsValue: RequestOptions = {}): Promise<T> {
  const urlValue = `${apiBaseUrl}`+`${pathValue}`;

  const responseValue = await fetch(urlValue, {
    method: optionsValue.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: optionsValue.body ? JSON.stringify(optionsValue.body) : undefined,
  });

  if (!responseValue.ok) {
    const errorText = await responseValue.text().catch(() => "");
    throw new Error(`API error ${responseValue.status}: ${errorText || responseValue.statusText}`);
  }

  return (await responseValue.json()) as T;
}

export const apiClient = {
  get: <T>(pathValue: string) => requestJson<T>(pathValue),
  post: <T>(pathValue: string, bodyValue: unknown) =>
    requestJson<T>(pathValue, { method: "POST", body: bodyValue }),
};
