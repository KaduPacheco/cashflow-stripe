/**
 * SECURE CACHE MANAGER
 * 
 * Este sistema usa ofuscação (btoa/atob) com checksum para integridade,
 * não criptografia verdadeira. Adequado para dados de subscription que:
 * - Não são críticos de segurança (tier, datas de expiração)
 * - Já são validados no backend
 * - Servem apenas para melhorar UX (evitar chamadas repetidas)
 * 
 * Para dados verdadeiramente sensíveis (tokens, senhas), use Web Crypto API.
 */

import { SubscriptionData, CachedSubscriptionData } from './types'
import { SecureLogger } from '@/lib/logger'

// Sistema de cache seguro com ofuscação simples
class SecureCacheManager {
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 horas
  private static readonly ENCRYPTION_KEY = 'subscription_cache_key_v1'

  // Criptografia simples usando btoa/atob com chave
  private static encrypt(data: string): string {
    try {
      const encoded = btoa(data)
      return btoa(this.ENCRYPTION_KEY + encoded)
    } catch (error) {
      SecureLogger.error('Cache encryption failed', error)
      return data
    }
  }

  private static decrypt(encryptedData: string): string {
    try {
      const decoded = atob(encryptedData)
      if (!decoded.startsWith(this.ENCRYPTION_KEY)) {
        throw new Error('Invalid cache key')
      }
      return atob(decoded.substring(this.ENCRYPTION_KEY.length))
    } catch (error) {
      SecureLogger.error('Cache decryption failed', error)
      return encryptedData
    }
  }

  // Gerar checksum simples para validar integridade
  private static generateChecksum(data: string): string {
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  private static getCacheKey(userId: string): string {
    return `secure_subscription_${userId}`
  }

  private static getChecksumKey(userId: string): string {
    return `subscription_checksum_${userId}`
  }

  static getCachedSubscription(userId: string): CachedSubscriptionData | null {
    try {
      const cacheKey = this.getCacheKey(userId)
      const checksumKey = this.getChecksumKey(userId)
      
      const encryptedData = localStorage.getItem(cacheKey)
      const storedChecksum = localStorage.getItem(checksumKey)
      
      if (!encryptedData || !storedChecksum) return null

      const decryptedData = this.decrypt(encryptedData)
      const calculatedChecksum = this.generateChecksum(decryptedData)
      
      // Verificar integridade
      if (calculatedChecksum !== storedChecksum) {
        SecureLogger.warn('Cache integrity check failed, clearing cache')
        this.clearCache(userId)
        return null
      }

      const parsed = JSON.parse(decryptedData) as CachedSubscriptionData
      const now = Date.now()
      
      // Verificar expiração
      if (now - parsed.cachedAt < this.CACHE_DURATION) {
        SecureLogger.debug('Using secure cached subscription data')
        return parsed
      }
      
      // Cache expirado
      this.clearCache(userId)
      return null
    } catch (error) {
      SecureLogger.error('Error reading secure subscription cache', error)
      this.clearCache(userId)
      return null
    }
  }

  static setCachedSubscription(userId: string, data: SubscriptionData): void {
    try {
      const cachedData: CachedSubscriptionData = {
        ...data,
        cachedAt: Date.now()
      }

      const dataString = JSON.stringify(cachedData)
      const encryptedData = this.encrypt(dataString)
      const checksum = this.generateChecksum(dataString)
      
      const cacheKey = this.getCacheKey(userId)
      const checksumKey = this.getChecksumKey(userId)
      
      localStorage.setItem(cacheKey, encryptedData)
      localStorage.setItem(checksumKey, checksum)
      
      SecureLogger.debug('Subscription data cached securely')
    } catch (error) {
      SecureLogger.error('Error caching subscription data securely', error)
    }
  }

  static clearCache(userId: string): void {
    try {
      const cacheKey = this.getCacheKey(userId)
      const checksumKey = this.getChecksumKey(userId)
      
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(checksumKey)
      
      SecureLogger.debug('Secure subscription cache cleared')
    } catch (error) {
      SecureLogger.error('Error clearing secure subscription cache', error)
    }
  }

  static validateCacheIntegrity(userId: string): boolean {
    try {
      const cached = this.getCachedSubscription(userId)
      return cached !== null
    } catch {
      return false
    }
  }
}

export { SecureCacheManager }
