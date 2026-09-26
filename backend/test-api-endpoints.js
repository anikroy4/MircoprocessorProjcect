/**
 * Test all API endpoints to verify data flow
 * Run: node test-api-endpoints.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(BASE_URL + path, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', reject);
  });
}

async function testEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');
  console.log('⚠️  Make sure backend server is running: cd backend && npm start\n');

  const tests = [
    {
      name: '📊 Get Latest Sensors',
      path: '/api/sensors/latest',
      check: (res) => {
        if (res.status === 200 && res.data.temperature !== undefined) {
          console.log(`   ✅ Temperature: ${res.data.temperature}°C`);
          console.log(`   ✅ Humidity: ${res.data.humidity}%`);
          console.log(`   ✅ Soil Moisture: ${res.data.soil_moisture}%`);
          console.log(`   ✅ Air Quality: ${res.data.air_quality}`);
          console.log(`   ✅ Created: ${res.data.created_at}`);
          return true;
        }
        return false;
      }
    },
    {
      name: '📈 Get Temperature History (24h)',
      path: '/api/sensors/history?type=temperature&range=24h',
      check: (res) => {
        if (res.status === 200 && Array.isArray(res.data)) {
          console.log(`   ✅ Data points: ${res.data.length}`);
          if (res.data.length > 0) {
            console.log(`   ✅ Sample: ${res.data[0].timestamp} → ${res.data[0].value}°C`);
          }
          return true;
        }
        return false;
      }
    },
    {
      name: '🎛️  Get Actuator Status',
      path: '/api/actuators/status',
      check: (res) => {
        if (res.status === 200 && Array.isArray(res.data)) {
          console.log(`   ✅ Actuators: ${res.data.length}`);
          res.data.forEach(act => {
            console.log(`   ✅ ${act.device}: ${act.status} (${act.mode})`);
          });
          return true;
        }
        return false;
      }
    },
    {
      name: '💻 Get System Status',
      path: '/api/system/status',
      check: (res) => {
        if (res.status === 200 && res.data.backend_status) {
          console.log(`   ✅ Backend: ${res.data.backend_status}`);
          console.log(`   ✅ ESP8266: ${res.data.esp8266_status}`);
          console.log(`   ✅ Arduino: ${res.data.arduino_status}`);
          console.log(`   ✅ Database: ${res.data.database_status}`);
          return true;
        }
        return false;
      }
    },
    {
      name: '⚙️  Get Settings',
      path: '/api/settings',
      check: (res) => {
        if (res.status === 200 && res.data.soil_min !== undefined) {
          console.log(`   ✅ Soil Min: ${res.data.soil_min}%`);
          console.log(`   ✅ Soil Max: ${res.data.soil_max}%`);
          console.log(`   ✅ Temp High: ${res.data.temperature_high}°C`);
          console.log(`   ✅ Air Quality Threshold: ${res.data.air_quality_threshold}`);
          return true;
        }
        return false;
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n${test.name}`);
    console.log(`   Endpoint: ${test.path}`);
    
    try {
      const result = await makeRequest(test.path);
      
      if (result.status !== 200) {
        console.log(`   ❌ HTTP ${result.status}: ${result.data.error || result.data}`);
        failed++;
        continue;
      }

      if (test.check(result)) {
        passed++;
      } else {
        console.log(`   ❌ Validation failed`);
        console.log(`   Response:`, result.data);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
      console.log(`   💡 Is the backend server running?`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results: ${passed}/${tests.length} passed\n`);

  if (failed === 0) {
    console.log('🎉 All API endpoints working correctly!');
    console.log('✅ Database has data');
    console.log('✅ Backend is responding');
    console.log('✅ Dashboard will display data automatically');
    console.log('\n💡 Next step: Start the frontend');
    console.log('   cd smart-greenhouse');
    console.log('   npm run dev');
  } else {
    console.log('⚠️  Some endpoints failed. Check:');
    console.log('   1. Backend server running: cd backend && npm start');
    console.log('   2. Database connection working');
    console.log('   3. Tables have data (run test-database-connection.js)');
  }
}

testEndpoints();
