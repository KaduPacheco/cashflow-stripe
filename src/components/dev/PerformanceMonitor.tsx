
import { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Trash2 } from 'lucide-react';

interface PerformanceMetric {
  component: string;
  renderTime: number;
  renderCount: number;
  timestamp: number;
}

export const PerformanceMonitor = memo(() => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (import.meta.env.DEV) {
      // Listen for performance logs
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        const message = args[0];
        if (typeof message === 'string' && message.startsWith('Performance:')) {
          const match = message.match(/Performance: (.+) render #(\d+) took ([\d.]+)ms/);
          if (match) {
            const [, component, renderCount, renderTime] = match;
            setMetrics(prev => [
              ...prev.slice(-19), // Keep last 20 metrics
              {
                component,
                renderTime: parseFloat(renderTime),
                renderCount: parseInt(renderCount),
                timestamp: Date.now()
              }
            ]);
          }
        }
        originalConsoleLog(...args);
      };

      return () => {
        console.log = originalConsoleLog;
      };
    }
  }, []);

  if (!import.meta.env.DEV || !isVisible) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    );
  }

  const clearMetrics = () => setMetrics([]);
  const slowMetrics = metrics.filter(m => m.renderTime > 16);

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96 overflow-auto z-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Performance Monitor</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={clearMetrics}>
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsVisible(false)}>
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs text-muted-foreground">
          Mostrando renders > 16ms (limiar 60fps)
        </div>
        
        {slowMetrics.length === 0 ? (
          <div className="text-xs text-green-600">
            ✓ Todos os componentes renderizando abaixo de 16ms
          </div>
        ) : (
          slowMetrics.slice(-10).map((metric, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="truncate">{metric.component}</span>
              <div className="flex items-center gap-2">
                <Badge variant={metric.renderTime > 50 ? 'destructive' : 'secondary'}>
                  {metric.renderTime.toFixed(1)}ms
                </Badge>
                <span className="text-muted-foreground">#{metric.renderCount}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
});

PerformanceMonitor.displayName = "PerformanceMonitor";
