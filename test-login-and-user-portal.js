/**
 * Test específico: Login y Portal de Usuario
 * Prueba completa de acceso y funcionalidades
 */

const puppeteer = require('puppeteer');

const CONFIG = {
  baseUrl: 'http://localhost:4200',
  testUser: {
    email: 'vendedor@test.com',
    password: 'Vendedor1$'
  },
  timeout: 30000,
  headless: false,
  slowMo: 100
};

const testResults = {
  passed: [],
  failed: [],
  warnings: [],
  startTime: Date.now()
};

async function takeScreenshot(page, name) {
  try {
    await page.screenshot({ 
      path: `./test-screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  } catch (error) {
    console.log(`⚠️  No se pudo tomar screenshot: ${name}`);
  }
}

async function waitForElement(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    return false;
  }
}

async function testLoginAndUserPortal() {
  console.log('🚀 Iniciando prueba de Login y Portal de Usuario\n');
  console.log('='.repeat(60));
  
  const browser = await puppeteer.launch({
    headless: CONFIG.headless,
    slowMo: CONFIG.slowMo,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  
  // Monitor errors
  const consoleErrors = [];
  const networkErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      error: request.failure().errorText
    });
  });

  try {
    // TEST 1: Navegar a página de login
    console.log('\n📋 TEST 1: Navegar a página de login');
    console.log('-'.repeat(60));
    
    await page.goto(`${CONFIG.baseUrl}/consufin/registro`, { 
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeout 
    });
    
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '01-login-page');
    
    const hasLoginForm = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]') !== null;
    
    if (hasLoginForm) {
      testResults.passed.push('Página de login cargada correctamente');
      console.log('✅ Página de login cargada');
    } else {
      testResults.failed.push({ test: 'Cargar página de login', error: 'Formulario de login no encontrado' });
      console.log('❌ Formulario de login no encontrado');
      throw new Error('Formulario de login no encontrado');
    }

    // TEST 2: Llenar formulario de login
    console.log('\n📋 TEST 2: Llenar formulario de login');
    console.log('-'.repeat(60));
    
    const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = await page.$('input[type="password"], input[name="password"]');
    
    if (!emailInput || !passwordInput) {
      testResults.failed.push({ test: 'Llenar formulario', error: 'Inputs no encontrados' });
      throw new Error('Inputs de login no encontrados');
    }
    
    await emailInput.click({ clickCount: 3 });
    await emailInput.type(CONFIG.testUser.email, { delay: 50 });
    await page.waitForTimeout(500);
    
    await passwordInput.click({ clickCount: 3 });
    await passwordInput.type(CONFIG.testUser.password, { delay: 50 });
    await page.waitForTimeout(500);
    
    await takeScreenshot(page, '02-form-filled');
    
    testResults.passed.push('Formulario de login llenado correctamente');
    console.log('✅ Credenciales ingresadas');

    // TEST 3: Enviar formulario y verificar login
    console.log('\n📋 TEST 3: Enviar formulario de login');
    console.log('-'.repeat(60));
    
    const submitButton = await page.$('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login"), button:has-text("Iniciar Sesión")');
    
    if (!submitButton) {
      testResults.failed.push({ test: 'Enviar login', error: 'Botón de submit no encontrado' });
      throw new Error('Botón de submit no encontrado');
    }
    
    console.log('🔘 Click en botón de login...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {}),
      submitButton.click()
    ]);
    
    await page.waitForTimeout(3000); // Esperar redirect
    await takeScreenshot(page, '03-after-login');
    
    const currentUrl = page.url();
    console.log(`📍 URL actual: ${currentUrl}`);
    
    // Verificar que estamos en el portal de usuario
    const isOnUserPortal = currentUrl.includes('/consufin/usuario') || 
                          currentUrl.includes('/usuario') ||
                          await page.$('app-user-portal') !== null ||
                          await page.$('h1:has-text("Bienvenido")') !== null ||
                          await page.$('text=Bienvenido') !== null;
    
    if (isOnUserPortal) {
      testResults.passed.push('Login exitoso - Redirección a portal de usuario');
      console.log('✅ Login exitoso - Redirección correcta');
    } else {
      testResults.failed.push({ 
        test: 'Verificar login', 
        error: `No se redirigió al portal. URL actual: ${currentUrl}` 
      });
      console.log(`❌ No se redirigió al portal. URL: ${currentUrl}`);
      throw new Error('Login falló');
    }

    // TEST 4: Verificar elementos del Dashboard
    console.log('\n📋 TEST 4: Verificar Dashboard del Portal de Usuario');
    console.log('-'.repeat(60));
    
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '04-dashboard-loaded');
    
    // Verificar elementos clave del dashboard
    const checks = [
      { name: 'Sidebar de navegación', selector: 'aside, nav, [class*="sidebar"], [class*="side"]' },
      { name: 'Nombre de usuario', selector: 'text=Usuario, text=Welcome, [class*="user-name"]' },
      { name: 'Sección Dashboard', selector: 'text=Dashboard, text=DASHBOARD' },
      { name: 'Botón Perfil', selector: 'button:has-text("Perfil"), text=Perfil' },
      { name: 'Botón Transacciones', selector: 'button:has-text("Transacciones"), text=Transacciones' },
      { name: 'Botón Notificaciones', selector: 'button:has-text("Notificaciones"), text=Notificaciones' }
    ];
    
    for (const check of checks) {
      const found = await page.evaluate((selector) => {
        const elements = document.querySelectorAll('*');
        for (let el of elements) {
          if (el.textContent && el.textContent.includes(selector.split(',')[0].trim())) {
            return true;
          }
        }
        return false;
      }, check.selector);
      
      if (found) {
        testResults.passed.push(`Dashboard: ${check.name} encontrado`);
        console.log(`✅ ${check.name} encontrado`);
      } else {
        testResults.warnings.push(`Dashboard: ${check.name} no encontrado`);
        console.log(`⚠️  ${check.name} no encontrado`);
      }
    }

    // TEST 5: Navegar a sección Perfil
    console.log('\n📋 TEST 5: Navegar a sección Perfil');
    console.log('-'.repeat(60));
    
    const perfilButton = await page.$('button:has-text("Perfil"), text=Perfil, [class*="perfil"]');
    if (perfilButton) {
      await perfilButton.click();
      await page.waitForTimeout(1500);
      await takeScreenshot(page, '05-perfil-section');
      
      // Verificar subsecciones de perfil
      const perfilSubsections = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
          hasDatosPersonales: text.includes('Datos Personales') || text.includes('Registro Persona'),
          hasDatosEmpresa: text.includes('Datos de la Empresa') || text.includes('Registro Empresa'),
          hasDatosBancarios: text.includes('Datos Bancarios') || text.includes('Bancaria')
        };
      });
      
      if (perfilSubsections.hasDatosPersonales) {
        testResults.passed.push('Sección Perfil: Datos Personales visible');
        console.log('✅ Datos Personales visible');
      }
      if (perfilSubsections.hasDatosEmpresa) {
        testResults.passed.push('Sección Perfil: Datos Empresa visible');
        console.log('✅ Datos Empresa visible');
      }
      if (perfilSubsections.hasDatosBancarios) {
        testResults.passed.push('Sección Perfil: Datos Bancarios visible');
        console.log('✅ Datos Bancarios visible');
      }
    } else {
      testResults.warnings.push('Botón Perfil no encontrado');
      console.log('⚠️  Botón Perfil no encontrado');
    }

    // TEST 6: Navegar a sección Transacciones
    console.log('\n📋 TEST 6: Navegar a sección Transacciones');
    console.log('-'.repeat(60));
    
    const transaccionesButton = await page.$('button:has-text("Transacciones"), text=Transacciones, [class*="transaccion"]');
    if (transaccionesButton) {
      await transaccionesButton.click();
      await page.waitForTimeout(1500);
      await takeScreenshot(page, '06-transacciones-section');
      
      // Verificar subsecciones
      const transSubsections = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
          hasVentas: text.includes('Ventas') || text.includes('Mis Ventas'),
          hasCompras: text.includes('Compras') || text.includes('Mis Compras'),
          hasDisputas: text.includes('Disputas')
        };
      });
      
      if (transSubsections.hasVentas || transSubsections.hasCompras) {
        testResults.passed.push('Sección Transacciones: Subsecciones visibles');
        console.log('✅ Subsecciones de transacciones visibles');
      }
    } else {
      testResults.warnings.push('Botón Transacciones no encontrado');
      console.log('⚠️  Botón Transacciones no encontrado');
    }

    // TEST 7: Navegar a sección Notificaciones
    console.log('\n📋 TEST 7: Navegar a sección Notificaciones');
    console.log('-'.repeat(60));
    
    const notificacionesButton = await page.$('button:has-text("Notificaciones"), text=Notificaciones, [class*="notificacion"]');
    if (notificacionesButton) {
      await notificacionesButton.click();
      await page.waitForTimeout(1500);
      await takeScreenshot(page, '07-notificaciones-section');
      
      testResults.passed.push('Sección Notificaciones accesible');
      console.log('✅ Sección Notificaciones accesible');
    } else {
      testResults.warnings.push('Botón Notificaciones no encontrado');
      console.log('⚠️  Botón Notificaciones no encontrado');
    }

    // TEST 8: Verificar WebSocket Connection
    console.log('\n📋 TEST 8: Verificar conexión WebSocket');
    console.log('-'.repeat(60));
    
    const wsConnected = await page.evaluate(() => {
      // Check if WebSocket is connected
      return window.performance && 
             window.performance.getEntriesByType('resource').some(r => 
               r.name.includes('ws://') || r.name.includes('wss://')
             );
    });
    
    if (wsConnected) {
      testResults.passed.push('WebSocket: Conexión detectada');
      console.log('✅ Conexión WebSocket detectada');
    } else {
      testResults.warnings.push('WebSocket: No se detectó conexión (puede ser normal si backend no está corriendo)');
      console.log('⚠️  Conexión WebSocket no detectada');
    }

    // TEST 9: Verificar localStorage (token y cache)
    console.log('\n📋 TEST 9: Verificar almacenamiento local');
    console.log('-'.repeat(60));
    
    const storage = await page.evaluate(() => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
      return {
        keys,
        hasToken: localStorage.getItem('consufin_access_token') !== null,
        hasRefreshToken: localStorage.getItem('consufin_refresh_token') !== null,
        hasUser: localStorage.getItem('consufin_user') !== null,
        cacheKeys: keys.filter(k => k && k.startsWith('cache_')).length
      };
    });
    
    if (storage.hasToken) {
      testResults.passed.push('LocalStorage: Token de acceso almacenado');
      console.log('✅ Token de acceso almacenado');
    } else {
      testResults.failed.push({ test: 'LocalStorage', error: 'Token no almacenado' });
      console.log('❌ Token no almacenado');
    }
    
    if (storage.hasRefreshToken) {
      testResults.passed.push('LocalStorage: Refresh token almacenado');
      console.log('✅ Refresh token almacenado');
    }
    
    if (storage.hasUser) {
      testResults.passed.push('LocalStorage: Datos de usuario almacenados');
      console.log('✅ Datos de usuario almacenados');
    }
    
    if (storage.cacheKeys > 0) {
      testResults.passed.push(`LocalStorage: ${storage.cacheKeys} entradas de caché`);
      console.log(`✅ ${storage.cacheKeys} entradas de caché encontradas`);
    }

    // TEST 10: Verificar funcionalidad de paginación (si hay datos)
    console.log('\n📋 TEST 10: Verificar controles de paginación');
    console.log('-'.repeat(60));
    
    const hasPagination = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Siguiente') || text.includes('Anterior') || text.includes('página');
    });
    
    if (hasPagination) {
      testResults.passed.push('Paginación: Controles encontrados');
      console.log('✅ Controles de paginación encontrados');
    } else {
      testResults.warnings.push('Paginación: No se encontraron controles (puede ser normal si hay menos de 20 items)');
      console.log('⚠️  Controles de paginación no encontrados (puede ser normal)');
    }

    // Reportar errores encontrados
    if (consoleErrors.length > 0) {
      console.log('\n⚠️  Errores de consola encontrados:');
      consoleErrors.slice(0, 5).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.substring(0, 100)}`);
        if (err.length > 100) console.log('     ...');
      });
      testResults.warnings.push(`${consoleErrors.length} errores de consola`);
    }
    
    if (networkErrors.length > 0) {
      console.log('\n⚠️  Errores de red encontrados:');
      networkErrors.slice(0, 5).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.url.substring(0, 80)} - ${err.error}`);
      });
      testResults.warnings.push(`${networkErrors.length} errores de red`);
    }

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message);
    testResults.failed.push({ 
      test: 'Prueba general', 
      error: error.message 
    });
    await takeScreenshot(page, 'error-final');
  } finally {
    await page.close();
    await browser.close();
  }

  // Generar reporte
  generateReport();
}

function generateReport() {
  const duration = ((Date.now() - testResults.startTime) / 1000).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 REPORTE FINAL DE PRUEBAS');
  console.log('='.repeat(60));
  console.log(`⏱️  Duración: ${duration}s`);
  console.log(`✅ Tests pasados: ${testResults.passed.length}`);
  console.log(`❌ Tests fallidos: ${testResults.failed.length}`);
  console.log(`⚠️  Advertencias: ${testResults.warnings.length}`);
  console.log('='.repeat(60));
  
  if (testResults.passed.length > 0) {
    console.log('\n✅ TESTS PASADOS:');
    testResults.passed.forEach((test, i) => {
      console.log(`  ${i + 1}. ${test}`);
    });
  }
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ TESTS FALLIDOS:');
    testResults.failed.forEach((test, i) => {
      console.log(`  ${i + 1}. ${test.test}: ${test.error}`);
    });
  }
  
  if (testResults.warnings.length > 0) {
    console.log('\n⚠️  ADVERTENCIAS:');
    testResults.warnings.slice(0, 10).forEach((warn, i) => {
      console.log(`  ${i + 1}. ${warn}`);
    });
  }
  
  console.log('\n📸 Screenshots guardados en: ./test-screenshots/');
  console.log('='.repeat(60));
  
  // Resumen final
  const successRate = ((testResults.passed.length / (testResults.passed.length + testResults.failed.length)) * 100).toFixed(1);
  console.log(`\n🎯 Tasa de éxito: ${successRate}%`);
  
  if (testResults.failed.length === 0) {
    console.log('🎉 ¡TODAS LAS PRUEBAS PASARON!');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisa los detalles arriba.');
  }
}

// Ejecutar prueba
if (require.main === module) {
  // Crear directorio de screenshots
  const fs = require('fs');
  if (!fs.existsSync('./test-screenshots')) {
    fs.mkdirSync('./test-screenshots', { recursive: true });
  }
  
  testLoginAndUserPortal().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { testLoginAndUserPortal };

