export function normalize(vec: { x: number; y: number }) {
  let len = Math.hypot(vec.x, vec.y);
  len = toFixed1(len)
  return len > 0 ? { speed: len, vec: { x: vec.x / len, y: vec.y / len } } : { speed: 0, vec: { x: 0, y: 0 } };
}

export function getRandomFactor() {
  return 0.2 + toFixed1(Math.random() * 0.4)
}

//битовое отделение дробной части, аналог toFixed(1) после запятой, типо 0.1 вместо 0.15345334
export function toFixed1(num: number) { return ((num * 10) | 0) / 10 } 

export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  } as T;
}