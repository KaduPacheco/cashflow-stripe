
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const AUDIT_REPORT_FILE = 'audit-report.txt';
const PACKAGE_JSON_PATH = 'package.json';

class SecurityAuditor {
  constructor() {
    this.auditResults = [];
    this.updateResults = [];
  }

  // Executar auditoria de segurança
  runSecurityAudit() {
    console.log('🔍 Executando auditoria de segurança...');
    
    try {
      // Executar npm audit
      const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
      const auditData = JSON.parse(auditOutput);
      
      this.processAuditResults(auditData);
      
      // Tentar corrigir vulnerabilidades automaticamente
      console.log('🔧 Tentando corrigir vulnerabilidades automaticamente...');
      execSync('npm audit fix', { stdio: 'inherit' });
      
    } catch (error) {
      console.error('❌ Erro na auditoria:', error.message);
      this.auditResults.push({
        type: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Processar resultados da auditoria
  processAuditResults(auditData) {
    const { vulnerabilities } = auditData;
    
    if (!vulnerabilities || Object.keys(vulnerabilities).length === 0) {
      console.log('✅ Nenhuma vulnerabilidade encontrada!');
      this.auditResults.push({
        type: 'success',
        message: 'Nenhuma vulnerabilidade encontrada',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Filtrar vulnerabilidades de severidade média ou alta
    Object.entries(vulnerabilities).forEach(([packageName, vulnInfo]) => {
      if (vulnInfo.severity === 'moderate' || vulnInfo.severity === 'high' || vulnInfo.severity === 'critical') {
        console.log(`⚠️  ${vulnInfo.severity.toUpperCase()}: ${packageName} - ${vulnInfo.title}`);
        
        this.auditResults.push({
          type: 'vulnerability',
          package: packageName,
          severity: vulnInfo.severity,
          title: vulnInfo.title,
          url: vulnInfo.url,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  // Verificar dependências desatualizadas
  checkOutdatedDependencies() {
    console.log('📦 Verificando dependências desatualizadas...');
    
    try {
      const outdatedOutput = execSync('npm outdated --json', { encoding: 'utf8' });
      if (outdatedOutput.trim()) {
        const outdatedData = JSON.parse(outdatedOutput);
        
        Object.entries(outdatedData).forEach(([packageName, versionInfo]) => {
          console.log(`📈 ${packageName}: ${versionInfo.current} → ${versionInfo.latest}`);
          
          this.updateResults.push({
            package: packageName,
            current: versionInfo.current,
            wanted: versionInfo.wanted,
            latest: versionInfo.latest,
            type: versionInfo.type
          });
        });
      } else {
        console.log('✅ Todas as dependências estão atualizadas!');
      }
    } catch (error) {
      console.log('ℹ️  Nenhuma dependência desatualizada encontrada ou erro ao verificar');
    }
  }

  // Analisar dependências não utilizadas
  analyzeUnusedDependencies() {
    console.log('🧹 Analisando dependências não utilizadas...');
    
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const unusedPackages = [];
    
    // Lista de pacotes que podem ser considerados não utilizados se não encontrados no código
    const checkablePackages = Object.keys(dependencies).filter(pkg => 
      !pkg.startsWith('@types/') && 
      !['typescript', 'vite', 'eslint', 'prettier'].includes(pkg)
    );
    
    checkablePackages.forEach(pkg => {
      try {
        // Verificar se o pacote é importado em algum arquivo
        const grepResult = execSync(`grep -r "from ['\"]${pkg}['\"]\\|import.*['\"]${pkg}['\"]\\|require.*['\"]${pkg}['\"]" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"`, 
          { encoding: 'utf8', stdio: 'pipe' });
        
        if (!grepResult.trim()) {
          unusedPackages.push(pkg);
        }
      } catch (error) {
        // Se grep não encontrar nada, o pacote pode não estar sendo usado
        unusedPackages.push(pkg);
      }
    });
    
    if (unusedPackages.length > 0) {
      console.log('⚠️  Possíveis dependências não utilizadas:');
      unusedPackages.forEach(pkg => {
        console.log(`   - ${pkg}`);
      });
    } else {
      console.log('✅ Nenhuma dependência não utilizada encontrada!');
    }
  }

  // Gerar relatório
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      auditResults: this.auditResults,
      updateResults: this.updateResults,
      summary: {
        vulnerabilities: this.auditResults.filter(r => r.type === 'vulnerability').length,
        outdatedPackages: this.updateResults.length,
        totalPackages: Object.keys(JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8')).dependencies || {}).length
      }
    };

    const reportContent = `
# Relatório de Auditoria de Segurança
Gerado em: ${report.timestamp}

## Resumo
- Vulnerabilidades encontradas: ${report.summary.vulnerabilities}
- Pacotes desatualizados: ${report.summary.outdatedPackages}
- Total de dependências: ${report.summary.totalPackages}

## Vulnerabilidades
${this.auditResults.map(r => r.type === 'vulnerability' ? 
  `- ${r.severity.toUpperCase()}: ${r.package} - ${r.title}` : ''
).filter(Boolean).join('\n') || 'Nenhuma vulnerabilidade encontrada'}

## Dependências Desatualizadas
${this.updateResults.map(r => 
  `- ${r.package}: ${r.current} → ${r.latest}`
).join('\n') || 'Todas as dependências estão atualizadas'}

## Dados Detalhados
${JSON.stringify(report, null, 2)}
    `.trim();

    fs.writeFileSync(AUDIT_REPORT_FILE, reportContent);
    console.log(`📄 Relatório salvo em: ${AUDIT_REPORT_FILE}`);
  }

  // Executar auditoria completa
  run() {
    console.log('🚀 Iniciando auditoria de segurança...\n');
    
    this.runSecurityAudit();
    this.checkOutdatedDependencies();
    this.analyzeUnusedDependencies();
    this.generateReport();
    
    console.log('\n✅ Auditoria de segurança concluída!');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.run();
}

module.exports = SecurityAuditor;
