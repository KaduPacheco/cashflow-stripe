
// Utilitários de validação e sanitização compartilhados
export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationException extends Error {
  public errors: ValidationError[];
  
  constructor(errors: ValidationError[]) {
    super('Validation failed');
    this.errors = errors;
    this.name = 'ValidationException';
  }
}

// Sanitização básica para prevenir XSS
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    throw new ValidationException([{ field: 'input', message: 'Must be a string' }]);
  }
  
  // Remove caracteres perigosos e HTML
  return input
    .replace(/[<>\"'&]/g, '') // Remove caracteres HTML perigosos
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limita tamanho
}

// Validação de email
export function validateEmail(email: unknown): string {
  if (typeof email !== 'string') {
    throw new ValidationException([{ field: 'email', message: 'Email must be a string' }]);
  }
  
  const sanitized = sanitizeString(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    throw new ValidationException([{ field: 'email', message: 'Invalid email format' }]);
  }
  
  if (sanitized.length > 254) {
    throw new ValidationException([{ field: 'email', message: 'Email too long' }]);
  }
  
  return sanitized;
}

// Validação de token de autorização
export function validateAuthToken(token: unknown): string {
  if (typeof token !== 'string') {
    throw new ValidationException([{ field: 'token', message: 'Token must be a string' }]);
  }
  
  // Tokens JWT têm formato específico
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new ValidationException([{ field: 'token', message: 'Invalid token format' }]);
  }
  
  // Verificar se contém apenas caracteres válidos para JWT
  const jwtRegex = /^[A-Za-z0-9_-]+$/;
  if (!parts.every(part => jwtRegex.test(part))) {
    throw new ValidationException([{ field: 'token', message: 'Invalid token characters' }]);
  }
  
  return token;
}

// Validação de URL de origem
export function validateOrigin(origin: unknown): string {
  if (typeof origin !== 'string') {
    return 'http://localhost:3000'; // Default seguro
  }
  
  try {
    const url = new URL(origin);
    
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      'https://csvkgokkvbtojjkitodc.supabase.co'
    ];
    
    if (!allowedOrigins.includes(origin) && !origin.includes('lovable.app')) {
      return 'http://localhost:3000'; // Default seguro
    }
    
    return origin;
  } catch {
    return 'http://localhost:3000'; // Default seguro se URL inválida
  }
}

// Validação de ID UUID
export function validateUUID(id: unknown, fieldName: string): string {
  if (typeof id !== 'string') {
    throw new ValidationException([{ field: fieldName, message: `${fieldName} must be a string` }]);
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(id)) {
    throw new ValidationException([{ field: fieldName, message: `Invalid ${fieldName} format` }]);
  }
  
  return id;
}

// Validação de transação
export function validateTransaction(data: any): any {
  const errors: ValidationError[] = [];
  
  // Validar estabelecimento
  if (!data.estabelecimento || typeof data.estabelecimento !== 'string') {
    errors.push({ field: 'estabelecimento', message: 'Estabelecimento é obrigatório' });
  } else if (data.estabelecimento.length > 200) {
    errors.push({ field: 'estabelecimento', message: 'Estabelecimento muito longo' });
  }
  
  // Validar valor
  if (!data.valor || typeof data.valor !== 'number' || data.valor <= 0) {
    errors.push({ field: 'valor', message: 'Valor deve ser um número positivo' });
  }
  
  // Validar tipo
  if (!data.tipo || !['receita', 'despesa'].includes(data.tipo)) {
    errors.push({ field: 'tipo', message: 'Tipo deve ser receita ou despesa' });
  }
  
  // Validar category_id
  if (!data.category_id) {
    errors.push({ field: 'category_id', message: 'Categoria é obrigatória' });
  } else {
    try {
      validateUUID(data.category_id, 'category_id');
    } catch (e) {
      errors.push({ field: 'category_id', message: 'ID da categoria inválido' });
    }
  }
  
  // Validar data
  if (!data.quando) {
    errors.push({ field: 'quando', message: 'Data é obrigatória' });
  }
  
  if (errors.length > 0) {
    throw new ValidationException(errors);
  }
  
  return {
    estabelecimento: sanitizeString(data.estabelecimento),
    valor: Number(data.valor),
    tipo: data.tipo,
    category_id: data.category_id,
    detalhes: data.detalhes ? sanitizeString(data.detalhes) : null,
    quando: data.quando
  };
}

// Rate limiting simples baseado em IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, maxRequests: number = 10, windowMs: number = 60000): void {
  const now = Date.now();
  const key = ip;
  
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return;
  }
  
  if (current.count >= maxRequests) {
    throw new ValidationException([{ field: 'rate_limit', message: 'Too many requests' }]);
  }
  
  current.count++;
}

// Função para logar erros de validação de forma segura
export function logValidationError(functionName: string, error: ValidationException, ip?: string): void {
  console.error(`[${functionName}] Validation error from IP ${ip || 'unknown'}:`, {
    errors: error.errors,
    timestamp: new Date().toISOString()
  });
}
