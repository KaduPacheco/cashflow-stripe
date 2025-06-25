
import { useEffect, useRef } from 'react';

export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef<number>();

  useEffect(() => {
    renderCount.current += 1;
    startTime.current = performance.now();
    
    return () => {
      if (startTime.current) {
        const renderTime = performance.now() - startTime.current;
        if (renderTime > 16) { // Log only if render takes more than 16ms (60fps threshold)
          console.log(`Performance: ${componentName} render #${renderCount.current} took ${renderTime.toFixed(2)}ms`);
        }
      }
    };
  });

  return renderCount.current;
}
