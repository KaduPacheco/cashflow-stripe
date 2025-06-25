
import { motion } from "framer-motion";
import { memo } from "react";

export const LoadingSpinner = memo(() => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p 
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Carregando...
        </motion.p>
      </motion.div>
    </div>
  );
});

LoadingSpinner.displayName = "LoadingSpinner";
