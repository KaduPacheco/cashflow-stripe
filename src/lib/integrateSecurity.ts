
import { SecurityMonitor } from '@/lib/securityMonitoring'
import { sanitizeInput } from '@/lib/security'
import { SecureLogger } from '@/lib/logger'

// Integração com formulários existentes
export function integrateSecurityMonitoring() {
  // Interceptar submissões de formulários
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch
    
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === 'string' ? input : input.toString()
      const method = init?.method || 'GET'
      
      // Monitorar requests para APIs sensíveis
      if (url.includes('/transacoes') || url.includes('/lembretes') || url.includes('/categorias')) {
        SecureLogger.debug('API request monitored', { 
          url: url.replace(/https?:\/\/[^\/]+/, ''), // Remove domain
          method 
        })
      }
      
      // Verificar body de requests POST/PUT por conteúdo suspeito
      if (init?.body && (method === 'POST' || method === 'PUT')) {
        const bodyString = typeof init.body === 'string' ? init.body : JSON.stringify(init.body)
        const userId = getCurrentUserId() // Implementar função para obter user ID
        
        if (userId && SecurityMonitor.detectBypassAttempt(bodyString, userId, `${method} ${url}`)) {
          SecureLogger.warn('Suspicious API request blocked', { url, method })
          throw new Error('Request blocked due to suspicious content')
        }
      }
      
      return originalFetch.call(this, input, init)
    }
  }
}

// Função para sanitizar inputs em tempo real
export function sanitizeFormInput(input: string, context: string = 'form'): string {
  const userId = getCurrentUserId()
  
  if (userId) {
    // Verificar tentativas de bypass
    if (SecurityMonitor.detectBypassAttempt(input, userId, context)) {
      SecureLogger.warn('Malicious input sanitized', { context })
      // Retornar versão sanitizada
      return sanitizeInput(input)
    }
  }
  
  return sanitizeInput(input)
}

// Função auxiliar para obter user ID atual
function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    // Tentar obter do localStorage do Supabase
    const authData = localStorage.getItem('sb-csvkgokkvbtojjkitodc-auth-token')
    if (authData) {
      const parsed = JSON.parse(authData)
      return parsed.user?.id || null
    }
    return null
  } catch {
    return null
  }
}

// Middleware para hooks de transações
export function secureTransactionInput(data: any): any {
  const userId = getCurrentUserId()
  
  if (!userId) {
    throw new Error('Authentication required')
  }
  
  // Verificar se usuário está bloqueado
  if (SecurityMonitor.isUserBlocked(userId)) {
    throw new Error('Account temporarily suspended due to suspicious activity')
  }
  
  // Sanitizar campos de texto
  const sanitizedData = { ...data }
  if (sanitizedData.estabelecimento) {
    sanitizedData.estabelecimento = sanitizeFormInput(sanitizedData.estabelecimento, 'transaction_establishment')
  }
  if (sanitizedData.detalhes) {
    sanitizedData.detalhes = sanitizeFormInput(sanitizedData.detalhes, 'transaction_details')
  }
  
  return sanitizedData
}
