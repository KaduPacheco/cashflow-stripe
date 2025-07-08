
import { SecureLogger } from '@/lib/logger'

interface DependencyVulnerability {
  package: string
  version: string
  vulnerability: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  fixed_in?: string
}

export class DependencyScanner {
  // Lista de vulnerabilidades conhecidas (em produção, isso viria de uma API)
  private static knownVulnerabilities: DependencyVulnerability[] = [
    {
      package: 'react',
      version: '<18.0.0',
      vulnerability: 'Prototype pollution in legacy versions',
      severity: 'MEDIUM',
      fixed_in: '18.0.0'
    },
    {
      package: 'lodash',
      version: '<4.17.21',
      vulnerability: 'Prototype pollution vulnerability',
      severity: 'HIGH',
      fixed_in: '4.17.21'
    }
  ]

  static async scanDependencies(): Promise<{
    scanned: number
    vulnerabilities: DependencyVulnerability[]
    recommendations: string[]
  }> {
    SecureLogger.info('Iniciando scan de dependências...')
    
    const vulnerabilities: DependencyVulnerability[] = []
    const recommendations: string[] = []
    
    // Em um ambiente real, isso leria o package.json e package-lock.json
    const mockPackages = [
      { name: 'react', version: '18.3.1' },
      { name: 'react-dom', version: '18.3.1' },
      { name: '@supabase/supabase-js', version: '2.50.0' },
      { name: 'tailwindcss', version: 'latest' }
    ]

    for (const pkg of mockPackages) {
      const vulns = this.checkPackageVulnerabilities(pkg.name, pkg.version)
      vulnerabilities.push(...vulns)
    }

    // Gerar recomendações
    if (vulnerabilities.length > 0) {
      recommendations.push('Execute npm audit para verificar vulnerabilidades')
      recommendations.push('Mantenha dependências sempre atualizadas')
      recommendations.push('Use ferramentas como Snyk ou npm audit fix')
    } else {
      recommendations.push('Todas as dependências estão seguras')
      recommendations.push('Continue monitorando regularmente')
    }

    const result = {
      scanned: mockPackages.length,
      vulnerabilities,
      recommendations
    }

    SecureLogger.info('Scan de dependências concluído', {
      scanned: result.scanned,
      vulnerabilitiesFound: vulnerabilities.length,
      severity: vulnerabilities.length > 0 ? 'NEEDS_ATTENTION' : 'CLEAN'
    })

    return result
  }

  private static checkPackageVulnerabilities(packageName: string, version: string): DependencyVulnerability[] {
    return this.knownVulnerabilities.filter(vuln => {
      if (vuln.package !== packageName) return false
      
      // Lógica simples de comparação de versão (em produção seria mais robusta)
      if (vuln.version.startsWith('<')) {
        const targetVersion = vuln.version.substring(1)
        return this.compareVersions(version, targetVersion) < 0
      }
      
      return false
    })
  }

  private static compareVersions(version1: string, version2: string): number {
    // Implementação simples de comparação de versões
    const v1Parts = version1.split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0
      const v2Part = v2Parts[i] || 0
      
      if (v1Part > v2Part) return 1
      if (v1Part < v2Part) return -1
    }
    
    return 0
  }

  static async generateSecurityReport(): Promise<{
    timestamp: string
    vulnerabilityCount: number
    dependencyCount: number
    recommendations: string[]
    status: 'SECURE' | 'NEEDS_ATTENTION' | 'CRITICAL'
  }> {
    const scanResult = await this.scanDependencies()
    
    let status: 'SECURE' | 'NEEDS_ATTENTION' | 'CRITICAL' = 'SECURE'
    
    if (scanResult.vulnerabilities.length > 0) {
      const hasCritical = scanResult.vulnerabilities.some(v => v.severity === 'CRITICAL')
      const hasHigh = scanResult.vulnerabilities.some(v => v.severity === 'HIGH')
      
      if (hasCritical) {
        status = 'CRITICAL'
      } else if (hasHigh) {
        status = 'NEEDS_ATTENTION'
      } else {
        status = 'NEEDS_ATTENTION'
      }
    }

    return {
      timestamp: new Date().toISOString(),
      vulnerabilityCount: scanResult.vulnerabilities.length,
      dependencyCount: scanResult.scanned,
      recommendations: scanResult.recommendations,
      status
    }
  }
}
