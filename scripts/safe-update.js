
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

class SafeUpdater {
  constructor() {
    this.packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    this.backupCreated = false;
  }

  // Criar backup do package.json
  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `package.json.backup-${timestamp}`;
    
    fs.copyFileSync('package.json', backupPath);
    console.log(`📦 Backup criado: ${backupPath}`);
    this.backupCreated = true;
  }

  // Verificar se uma dependência é segura para atualizar
  isSafeToUpdate(packageName, currentVersion, latestVersion) {
    // Lista de pacotes críticos que requerem revisão manual
    const criticalPackages = [
      'react', 'react-dom', 'typescript', 'vite',
      '@supabase/supabase-js', '@sentry/react', '@sentry/node'
    ];

    if (criticalPackages.includes(packageName)) {
      return false;
    }

    // Verificar se é uma atualização major (potencialmente breaking)
    const currentMajor = parseInt(currentVersion.split('.')[0]);
    const latestMajor = parseInt(latestVersion.split('.')[0]);

    return currentMajor === latestMajor;
  }

  // Atualizar dependências seguras automaticamente
  async updateSafeDependencies() {
    console.log('🔄 Verificando atualizações seguras...');

    try {
      // Verificar dependências desatualizadas
      const outdatedOutput = execSync('npm outdated --json', { encoding: 'utf8' });
      
      if (!outdatedOutput.trim()) {
        console.log('✅ Todas as dependências já estão atualizadas!');
        return;
      }

      const outdatedData = JSON.parse(outdatedOutput);
      const safeUpdates = [];
      const manualReviewRequired = [];

      Object.entries(outdatedData).forEach(([packageName, versionInfo]) => {
        if (this.isSafeToUpdate(packageName, versionInfo.current, versionInfo.latest)) {
          safeUpdates.push(packageName);
        } else {
          manualReviewRequired.push({
            package: packageName,
            current: versionInfo.current,
            latest: versionInfo.latest,
            reason: 'Atualização major ou pacote crítico'
          });
        }
      });

      // Mostrar atualizações que requerem revisão manual
      if (manualReviewRequired.length > 0) {
        console.log('\n⚠️  Atualizações que requerem revisão manual:');
        manualReviewRequired.forEach(item => {
          console.log(`   - ${item.package}: ${item.current} → ${item.latest} (${item.reason})`);
        });
      }

      // Atualizar dependências seguras
      if (safeUpdates.length > 0) {
        console.log('\n🔧 Atualizando dependências seguras:');
        safeUpdates.forEach(pkg => {
          console.log(`   - ${pkg}`);
        });

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const answer = await new Promise(resolve => {
          rl.question('\nProsseguir com as atualizações seguras? (y/n): ', resolve);
        });

        rl.close();

        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          this.createBackup();
          
          // Atualizar cada pacote individualmente para maior controle
          safeUpdates.forEach(pkg => {
            try {
              console.log(`Atualizando ${pkg}...`);
              execSync(`npm update ${pkg}`, { stdio: 'inherit' });
            } catch (error) {
              console.error(`❌ Erro ao atualizar ${pkg}:`, error.message);
            }
          });

          console.log('✅ Atualizações seguras concluídas!');
        } else {
          console.log('❌ Atualizações canceladas pelo usuário.');
        }
      } else {
        console.log('✅ Nenhuma atualização segura disponível.');
      }

    } catch (error) {
      console.log('ℹ️  Nenhuma dependência desatualizada encontrada.');
    }
  }

  // Verificar dependências abandonadas
  checkAbandonedPackages() {
    console.log('\n🔍 Verificando dependências abandonadas...');
    
    const dependencies = { ...this.packageJson.dependencies, ...this.packageJson.devDependencies };
    const suspiciousPackages = [];

    Object.keys(dependencies).forEach(packageName => {
      try {
        // Verificar informações do pacote
        const packageInfoOutput = execSync(`npm view ${packageName} time --json`, { encoding: 'utf8' });
        const packageInfo = JSON.parse(packageInfoOutput);
        
        const versions = Object.keys(packageInfo);
        const lastVersion = versions[versions.length - 1];
        const lastUpdate = new Date(packageInfo[lastVersion]);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        if (lastUpdate < sixMonthsAgo) {
          suspiciousPackages.push({
            package: packageName,
            lastUpdate: lastUpdate.toISOString().split('T')[0],
            daysSinceUpdate: Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))
          });
        }
      } catch (error) {
        // Ignorar erros de packages que não existem no registry
      }
    });

    if (suspiciousPackages.length > 0) {
      console.log('⚠️  Dependências potencialmente abandonadas:');
      suspiciousPackages.forEach(item => {
        console.log(`   - ${item.package} (última atualização: ${item.lastUpdate}, ${item.daysSinceUpdate} dias atrás)`);
      });
    } else {
      console.log('✅ Todas as dependências parecem estar ativas!');
    }
  }

  // Executar processo completo
  async run() {
    console.log('🚀 Iniciando atualização segura de dependências...\n');
    
    await this.updateSafeDependencies();
    this.checkAbandonedPackages();
    
    console.log('\n✅ Processo de atualização concluído!');
    
    if (this.backupCreated) {
      console.log('\n💡 Dica: Teste a aplicação e, se tudo estiver funcionando, você pode remover os arquivos de backup.');
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const updater = new SafeUpdater();
  updater.run().catch(console.error);
}

module.exports = SafeUpdater;
