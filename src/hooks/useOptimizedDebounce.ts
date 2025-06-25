
import { useCallback, useRef, useEffect } from 'react';

export function useOptimizedDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
): T {
  const { leading = false, trailing = true, maxWait } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTimeRef = useRef<number>();
  const lastInvokeTimeRef = useRef<number>(0);

  const invokeFunc = useCallback((...args: Parameters<T>) => {
    lastInvokeTimeRef.current = Date.now();
    return callback(...args);
  }, [callback]);

  const shouldInvoke = useCallback((time: number) => {
    const timeSinceLastCall = time - (lastCallTimeRef.current || 0);
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;
    
    return (
      !lastCallTimeRef.current ||
      timeSinceLastCall >= delay ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }, [delay, maxWait]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);
      
      lastCallTimeRef.current = time;

      if (isInvoking) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = undefined;
        }
        
        if (leading) {
          return invokeFunc(...args);
        }
      }

      if (!timeoutRef.current && trailing) {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = undefined;
          invokeFunc(...args);
        }, delay);
      }

      if (maxWait !== undefined && !maxTimeoutRef.current) {
        maxTimeoutRef.current = setTimeout(() => {
          maxTimeoutRef.current = undefined;
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
          }
          invokeFunc(...args);
        }, maxWait);
      }
    },
    [delay, invokeFunc, leading, trailing, shouldInvoke, maxWait]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}
