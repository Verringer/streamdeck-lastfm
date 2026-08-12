const LAST_FM_API_URL = 'https://ws.audioscrobbler.com/2.0/';

interface ApiErrorResponse {
  error?: number;
  message?: string;
}

interface ResponseCacheEntry {
  expiresAt: number;
  response: Promise<unknown>;
}

const RESPONSE_CACHE_TTL_MS = 5_000;
const RESPONSE_CACHE_MAX_ENTRIES = 32;
const responseCache = new Map<string, ResponseCacheEntry>();

const getResponseCacheKey = (url: string, init?: RequestInit): string | undefined => {
  const method = init?.method?.toUpperCase() ?? 'GET';
  if (method !== 'GET') {
    return undefined;
  }

  const headers = [...new Headers(init?.headers).entries()].sort(([left], [right]) => left.localeCompare(right));
  return JSON.stringify([url, headers]);
};

export const createLastFmUrl = (method: string, parameters: Record<string, string>): string => {
  const url = new URL(LAST_FM_API_URL);
  url.search = new URLSearchParams({ method, ...parameters, format: 'json' }).toString();
  return url.toString();
};

export const getPositionedItem = <T>(items: T[], position: string): T | undefined => {
  const parsedPosition = Number.parseInt(position, 10);
  const index = Number.isInteger(parsedPosition) && parsedPosition > 0 ? parsedPosition - 1 : 0;
  return items[index];
};

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed with HTTP ${response.status}`);
  }

  const data = (await response.json()) as T & ApiErrorResponse;
  if (data.error !== undefined) {
    throw new Error(data.message ?? `API error ${data.error}`);
  }

  return data;
};

export const fetchJson = <T>(url: string, init?: RequestInit): Promise<T> => {
  const cacheKey = getResponseCacheKey(url, init);
  if (cacheKey === undefined) {
    return requestJson<T>(url, init);
  }

  const now = Date.now();
  const cached = responseCache.get(cacheKey);
  if (cached !== undefined && cached.expiresAt > now) {
    return cached.response as Promise<T>;
  }

  for (const [key, entry] of responseCache) {
    if (entry.expiresAt <= now) {
      responseCache.delete(key);
    }
  }

  if (responseCache.size >= RESPONSE_CACHE_MAX_ENTRIES) {
    const oldest = responseCache.keys().next();
    if (!oldest.done) {
      responseCache.delete(oldest.value);
    }
  }

  const response = requestJson<T>(url, init).catch((error: unknown) => {
    if (responseCache.get(cacheKey)?.response === response) {
      responseCache.delete(cacheKey);
    }
    throw error;
  });
  responseCache.set(cacheKey, { expiresAt: now + RESPONSE_CACHE_TTL_MS, response });
  return response;
};

export const imageUrlToDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Image request failed with HTTP ${response.status}`);
  }

  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read image data'));
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Unable to convert image to a data URL'));
      }
    };
    reader.readAsDataURL(blob);
  });
};

export const cropImageToSquare = async (url: string, size = 144): Promise<string> => {
  const source = await imageUrlToDataUrl(url);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error('Unable to decode image'));
    element.src = source;
  });

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (context === null) {
    throw new Error('Unable to create image canvas');
  }

  const scale = Math.max(size / image.width, size / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);

  return canvas.toDataURL('image/png');
};
