/**
 * Safe API request helper that parses responses reliably and guards against
 * HTML/non-JSON error pages (like Vercel 404 or 500 pages), preventing
 * "Unexpected token 'T', The page could not be found is not valid JSON" syntax errors.
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, options);
  const text = await response.text();

  let data: any = null;
  const isJson =
    response.headers.get('content-type')?.includes('application/json') ||
    text.trim().startsWith('{') ||
    text.trim().startsWith('[');

  if (isJson) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let defaultMsg = `Permintaan gagal (HTTP ${response.status})`;
    if (response.status === 404) {
      defaultMsg = `Endpoint API (${endpoint}) tidak ditemukan (404). Pastikan backend serverless Vercel telah aktif.`;
    } else if (response.status >= 500) {
      defaultMsg = `Terjadi kendala pada server backend (HTTP ${response.status}). Silakan muat ulang.`;
    }

    const errorMessage = data?.error || data?.message || defaultMsg;
    throw new Error(errorMessage);
  }

  if (data === null) {
    throw new Error(
      `Respon dari server bukan format JSON yang valid (HTTP ${response.status}).`
    );
  }

  return data as T;
}
