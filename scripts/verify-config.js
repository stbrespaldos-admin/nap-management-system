#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración del Sistema de Gestión de NAPs...\n');

// Verificar archivos de configuración
const configFiles = [
  { path: '.env', name: 'Backend Environment' },
  { path: 'frontend/.env.local', name: 'Frontend Environment' }
];

let allConfigured = true;

configFiles.forEach(({ path: filePath, name }) => {
  console.log(`📁 Verificando ${name}:`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ Archivo ${filePath} no encontrado`);
    allConfigured = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  const requiredVars = filePath === '.env' ? [
    'GOOGLE_MAPS_API_KEY',
    'GOOGLE_OAUTH_CLIENT_ID', 
    'GOOGLE_OAUTH_CLIENT_SECRET',
    'SPREADSHEET_ID',
    'JWT_SECRET'
  ] : [
    'REACT_APP_GOOGLE_MAPS_API_KEY'
  ];
  
  requiredVars.forEach(varName => {
    const line = lines.find(l => l.startsWith(`${varName}=`));
    if (!line) {
      console.log(`   ❌ Variable ${varName} no encontrada`);
      allConfigured = false;
    } else {
      const value = line.split('=')[1];
      if (!value || value.includes('TU_') || value.includes('your_') || value.includes('AQUI')) {
        console.log(`   ⚠️  Variable ${varName} necesita configuración real`);
        allConfigured = false;
      } else {
        console.log(`   ✅ Variable ${varName} configurada`);
      }
    }
  });
  
  console.log('');
});

// Verificar estructura del proyecto
console.log('📂 Verificando estructura del proyecto:');

const requiredDirs = ['frontend', 'backend', 'scripts'];
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`   ✅ Directorio ${dir} existe`);
  } else {
    console.log(`   ❌ Directorio ${dir} no encontrado`);
    allConfigured = false;
  }
});

// Verificar package.json
console.log('\n📦 Verificando package.json:');
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['dev', 'build', 'docker:build', 'health:check'];
  
  requiredScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
      console.log(`   ✅ Script ${script} disponible`);
    } else {
      console.log(`   ❌ Script ${script} no encontrado`);
    }
  });
} else {
  console.log('   ❌ package.json no encontrado');
  allConfigured = false;
}

// Resumen final
console.log('\n' + '='.repeat(50));
if (allConfigured) {
  console.log('🎉 ¡Configuración completa! El sistema está listo para ejecutarse.');
  console.log('\nPróximos pasos:');
  console.log('1. npm run install:all');
  console.log('2. npm run dev');
  console.log('3. Abrir http://localhost:3000');
} else {
  console.log('⚠️  Configuración incompleta. Revisa los elementos marcados arriba.');
  console.log('\nPasos pendientes:');
  console.log('1. Configura las variables de entorno en .env y frontend/.env.local');
  console.log('2. Sigue la guía en CONFIGURACION_GOOGLE.md');
  console.log('3. Ejecuta este script nuevamente para verificar');
}

console.log('\n📚 Recursos de ayuda:');
console.log('- CONFIGURACION_GOOGLE.md - Guía completa de configuración');
console.log('- DEPLOYMENT.md - Guía de despliegue');
console.log('- setup-auth.md - Configuración de autenticación');

process.exit(allConfigured ? 0 : 1);