
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Play } from 'lucide-react'
import { motion } from 'framer-motion'

interface WelcomeMessageProps {
  onLoadDemo: () => void
  onStartTour: () => void
  loading: boolean
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  onLoadDemo,
  onStartTour,
  loading
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 border-2 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Bem-vindo ao Cash Flow!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Parece que você ainda não tem transações registradas. 
            Que tal explorar o app com alguns dados de exemplo?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={onLoadDemo} 
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {loading ? 'Carregando...' : 'Carregar dados de exemplo'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onStartTour}
              className="border-primary/20 hover:bg-primary/5"
            >
              <Play className="h-4 w-4 mr-2" />
              Fazer tour guiado
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            💡 Os dados de exemplo podem ser removidos a qualquer momento
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
