
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Validar ambiente antes de inicializar
try {
  // Importar validação de ambiente
  import('./lib/env').then(({ validateEnv }) => {
    validateEnv()
    console.log('✅ Ambiente validado com sucesso')
  })
} catch (error) {
  console.error('❌ Erro ao validar ambiente:', error)
}

createRoot(document.getElementById("root")!).render(<App />);
