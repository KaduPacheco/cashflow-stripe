
import { SecureLogger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'

// Sistema de detecção de tentativas de bypass
export class SecurityMonitor {
  private static suspiciousActivities = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>()
  private static readonly SUSPICIOUS_PATTERNS = [
    /javascript:/gi,
    /<script/gi,
    /eval\(/gi,
    /union\s+select/gi,
    /drop\s+table/gi,
    /delete\s+from/gi,
    /insert\s+into/gi,
    /update\s+set/gi,
    /__proto__/gi,
    /constructor/gi
  ]

  static detectBypassAttempt(input: string, userId: string, context: string): boolean {
    const suspiciousFound = this.SUSPICIOUS_PATTERNS.some(pattern => pattern.test(input))
    
    if (suspiciousFound) {
      this.logSuspiciousActivity(userId, context, input)
      this.incrementSuspiciousActivity(userId)
      return true
    }
    
    return false
  }

  private static logSuspiciousActivity(userId: string, context: string, input: string) {
    SecureLogger.auth('SECURITY ALERT - Bypass attempt detected', {
      userId: '***MASKED***',
      context,
      input: '***SUSPICIOUS_INPUT***',
      timestamp: new Date().toISOString(),
      severity: 'HIGH'
    })
    
    // Log para auditoria no Supabase (apenas metadados)
    this.saveSecurityLog({
      userId,
      eventType: 'BYPASS_ATTEMPT',
      context,
      severity: 'HIGH',
      blocked: true
    })
  }

  private static incrementSuspiciousActivity(userId: string) {
    const now = Date.now()
    const record = this.suspiciousActivities.get(userId) || { count: 0, lastAttempt: 0, blocked: false }
    
    record.count += 1
    record.lastAttempt = now
    
    // Bloquear após 3 tentativas suspeitas em 1 hora
    if (record.count >= 3 && (now - record.lastAttempt) < 3600000) {
      record.blocked = true
      this.triggerSecurityAlert(userId, 'MULTIPLE_BYPASS_ATTEMPTS')
    }
    
    this.suspiciousActivities.set(userId, record)
  }

  static isUserBlocked(userId: string): boolean {
    const record = this.suspiciousActivities.get(userId)
    return record?.blocked || false
  }

  private static async saveSecurityLog(logData: {
    userId: string
    eventType: string
    context: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    blocked: boolean
  }) {
    try {
      // Salvamos apenas metadados, nunca dados sensíveis
      await supabase.from('security_logs').insert({
        user_id: logData.userId,
        event_type: logData.eventType,
        context: logData.context,
        severity: logData.severity,
        blocked: logData.blocked,
        created_at: new Date().toISOString()
      })
    } catch (error) {
      SecureLogger.error('Failed to save security log', error)
    }
  }

  private static triggerSecurityAlert(userId: string, alertType: string) {
    SecureLogger.auth('CRITICAL SECURITY ALERT', {
      userId: '***MASKED***',
      alertType,
      timestamp: new Date().toISOString(),
      action: 'USER_BLOCKED'
    })
    
    // Em produção, aqui poderia enviar email/webhook para administradores
    this.saveSecurityLog({
      userId,
      eventType: 'SECURITY_ALERT',
      context: alertType,
      severity: 'CRITICAL',
      blocked: true
    })
  }

  static getSecurityMetrics(userId?: string) {
    const metrics = {
      totalSuspiciousActivities: 0,
      blockedUsers: 0,
      recentAttempts: 0,
      topThreats: [] as string[]
    }

    for (const [id, record] of this.suspiciousActivities.entries()) {
      if (!userId || userId === id) {
        metrics.totalSuspiciousActivities += record.count
        if (record.blocked) metrics.blockedUsers += 1
        
        // Últimas 24h
        if (Date.now() - record.lastAttempt < 86400000) {
          metrics.recentAttempts += 1
        }
      }
    }

    return metrics
  }
}
