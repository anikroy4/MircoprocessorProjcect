/**
 * Quick database connection test script
 * Run: node test-database-connection.js
 */

require('dotenv').config({ path: './.env' });
const mysql = require('mysql2/promise');

async function testDatabase() {
  console.log('🔍 Testing Database Connection...\n');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'greenhouse_db',
    port: process.env.DB_PORT || 3306,
  };

  console.log('📋 Connection Config:');
  console.log(`   Host: ${config.host}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   Port: ${config.port}\n`);

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Database connected successfully!\n');

    // Check sensor_readings table
    console.log('📊 Checking sensor_readings table...');
    const [countResult] = await connection.query(
      'SELECT COUNT(*) as total FROM sensor_readings'
    );
    console.log(`   Total records: ${countResult[0].total}`);

    // Get latest 5 records
    if (countResult[0].total > 0) {
      const [latest] = await connection.query(
        `SELECT 
          id,
          temperature,
          humidity,
          soil_moisture,
          air_quality,
          created_at
         FROM sensor_readings 
         ORDER BY created_at DESC 
         LIMIT 5`
      );

      console.log('\n📈 Latest 5 sensor readings:');
      latest.forEach((row, idx) => {
        console.log(`\n   ${idx + 1}. ID: ${row.id} | ${row.created_at}`);
        console.log(`      Temp: ${row.temperature}°C`);
        console.log(`      Humidity: ${row.humidity}%`);
        console.log(`      Soil: ${row.soil_moisture}%`);
        console.log(`      Air Quality: ${row.air_quality}`);
      });
    } else {
      console.log('\n⚠️  No data in sensor_readings table yet.');
      console.log('   Run the backend poller to start collecting data.');
    }

    // Check actuator_current_status
    console.log('\n\n🎛️  Checking actuator_current_status...');
    const [actuators] = await connection.query(
      'SELECT device, status, mode, updated_at FROM actuator_current_status'
    );
    
    if (actuators.length > 0) {
      console.log('   Actuators:');
      actuators.forEach(act => {
        console.log(`   - ${act.device}: ${act.status} (${act.mode}) - ${act.updated_at}`);
      });
    } else {
      console.log('   No actuator data yet.');
    }

    // Check system_status
    console.log('\n\n💻 Checking system_status...');
    const [system] = await connection.query(
      'SELECT * FROM system_status WHERE id = 1'
    );
    
    if (system.length > 0) {
      const status = system[0];
      console.log(`   Backend: ${status.backend_status}`);
      console.log(`   ESP8266: ${status.esp8266_status}`);
      console.log(`   Arduino: ${status.arduino_status}`);
      console.log(`   Database: ${status.database_status}`);
      console.log(`   Last sensor update: ${status.last_sensor_update}`);
    }

    await connection.end();
    console.log('\n\n✅ Database test complete!');

    if (countResult[0].total === 0) {
      console.log('\n💡 Next steps:');
      console.log('   1. Make sure ESP8266 is connected to WiFi');
      console.log('   2. Start the backend server: cd backend && npm start');
      console.log('   3. Backend poller will automatically fetch data from ESP8266');
      console.log('   4. Data will be saved to database every 3 seconds');
    } else {
      console.log('\n🎉 Database has data! Dashboard will display it automatically.');
    }

  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Is XAMPP MySQL server running?');
    console.error('   2. Check backend/.env configuration');
    console.error('   3. Verify database "greenhouse_db" exists');
    console.error('   4. Check MySQL user credentials');
  }
}

testDatabase();
