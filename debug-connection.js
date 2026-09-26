/**
 * Debug Connection Issues
 * Run: node debug-connection.js
 */

const http = require('http');

async function testEndpoint(url, name) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const req = http.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`   ✅ Status: ${res.statusCode}`);
          try {
            const json = JSON.parse(data);
            console.log(`   ✅ Response:`, JSON.stringify(json).substring(0, 100));
            resolve(true);
          } catch (e) {
            console.log(`   ⚠️  Non-JSON response: ${data.substring(0, 50)}`);
            resolve(false);
          }
        } else {
          console.log(`   ❌ Status: ${res.statusCode}`);
          console.log(`   Response: ${data}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`   ❌ Timeout: No response within 5 seconds`);
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Smart Greenhouse - Connection Debug Tool');
  console.log('═══════════════════════════════════════════════════');

  const tests = [
    {
      name: 'Backend Health Check',
      url: 'http://localhost:5000/health'
    },
    {
      name: 'Get Latest Sensors',
      url: 'http://localhost:5000/api/sensors/latest'
    },
    {
      name: 'Get Actuator Status',
      url: 'http://localhost:5000/api/actuators/status'
    },
    {
      name: 'Get System Status',
      url: 'http://localhost:5000/api/system/status'
    },
    {
      name: 'Get Settings',
      url: 'http://localhost:5000/api/settings'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testEndpoint(test.url, test.name);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log(`\n📊 Results: ${passed}/${tests.length} passed`);
  
  if (passed === tests.length) {
    console.log('\n✅ All tests passed! Backend is working correctly.');
    console.log('   The issue might be:');
    console.log('   1. Frontend not running');
    console.log('   2. CORS configuration');
    console.log('   3. Browser cache');
    console.log('   4. Wrong API URL in frontend');
  } else if (failed === tests.length) {
    console.log('\n❌ All tests failed! Backend is not responding.');
    console.log('   Check:');
    console.log('   1. Is backend server running? (cd backend && npm start)');
    console.log('   2. Is MySQL running? (XAMPP Control Panel)');
    console.log('   3. Is port 5000 available?');
    console.log('   4. Check backend console for errors');
  } else {
    console.log('\n⚠️  Some tests failed.');
    console.log('   Check backend console for specific errors.');
  }

  console.log('\n💡 Next steps:');
  console.log('   1. Check backend terminal output');
  console.log('   2. Open http://localhost:5000/health in browser');
  console.log('   3. Check browser DevTools → Network tab');
  console.log('   4. Verify smart-greenhouse/.env has correct API URL');
  
  console.log('\n');
}

main();
