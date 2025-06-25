
import { Suspense, ComponentType, memo } from 'react';
import { EnhancedLoadingSpinner } from './enhanced-loading-spinner';
import { motion } from 'framer-motion';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  errorMessage?: string;
}

const DefaultFallback = memo(() => (
  <EnhancedLoadingSpinner message="Carregando componente..." />
));

DefaultFallback.displayName = "DefaultFallback";

export const LazyWrapper = memo(({ 
  children, 
  fallback: Fallback = DefaultFallback,
  errorMessage = "Erro ao carregar componente"
}: LazyWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Suspense fallback={<Fallback />}>
        {children}
      </Suspense>
    </motion.div>
  );
});

LazyWrapper.displayName = "LazyWrapper";
