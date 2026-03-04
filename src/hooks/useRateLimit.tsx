import { useCallback, useRef } from "react";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/** Client-side rate limiting hook */
export const useRateLimit = (config: RateLimitConfig = { maxRequests: 10, windowMs: 60_000 }) => {
  const requests = useRef<number[]>([]);

  const checkLimit = useCallback((): boolean => {
    const now = Date.now();
    requests.current = requests.current.filter(t => now - t < config.windowMs);
    
    if (requests.current.length >= config.maxRequests) {
      console.warn("[RATE_LIMIT] Request throttled");
      return false;
    }
    
    requests.current.push(now);
    return true;
  }, [config.maxRequests, config.windowMs]);

  return { checkLimit, remaining: config.maxRequests - requests.current.length };
};
