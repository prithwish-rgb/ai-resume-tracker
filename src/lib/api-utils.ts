// API utility functions with better error handling and performance optimization

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

// Custom fetch wrapper with timeout and better error handling
export async function fetchWithTimeout(
  url: string, 
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// Generic API call handler
export async function apiCall<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetchWithTimeout(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Debounced function helper
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// URL validation and formatting
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function formatUrl(url: string): string {
  if (!url) return '';
  
  // Add protocol if missing
  if (!url.match(/^https?:\/\//)) {
    return `https://${url}`;
  }
  
  return url;
}

export function truncateUrl(url: string, maxLength: number = 50): string {
  if (!url || url.length <= maxLength) return url;
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname + urlObj.search;
    
    if (domain.length > maxLength) {
      return `${domain.substring(0, maxLength - 3)}...`;
    }
    
    const remainingLength = maxLength - domain.length - 3; // -3 for "..."
    if (path.length > remainingLength) {
      return `${domain}/${path.substring(1, remainingLength)}...`;
    }
    
    return url;
  } catch {
    return url.length > maxLength ? `${url.substring(0, maxLength - 3)}...` : url;
  }
}

// Local storage helpers with error handling
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: (key: string, value: any): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

// Performance monitoring
export function measurePerformance<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name?: string
): T {
  return (async (...args: Parameters<T>) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const end = performance.now();
      console.log(`${name || fn.name} took ${end - start} milliseconds`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`${name || fn.name} failed after ${end - start} milliseconds:`, error);
      throw error;
    }
  }) as T;
}
