import { useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

/**
 * usePersistFn instead of useCallback to reduce cognitive load.
 * Returns a stable function reference that always calls the latest version of fn.
 */
export function usePersistFn<T extends AnyFunction>(fn: T): T {
  const fnRef = useRef<T>(fn);
  fnRef.current = fn;

  const persistFn = useRef<T | null>(null);
  if (!persistFn.current) {
    persistFn.current = function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
      return fnRef.current.apply(this, args);
    } as T;
  }

  return persistFn.current;
}
