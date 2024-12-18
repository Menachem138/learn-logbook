import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import tls from 'tls';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testConnection() {
  let client: pg.Client | null = null;
  try {
    console.log('Testing database connection...');

    // Use hostname for SSL verification but IP for connection
    const dbHostname = 'db.shjwvwhijgehquuteekv.supabase.co';
    const dbIp = '52.204.196.254';

    client = new pg.Client({
      user: 'postgres',
      password: process.env.SUPABASE_SERVICE_ROLE_KEY,
      host: dbIp,
      port: 5432,
      database: 'postgres',
      ssl: {
        rejectUnauthorized: true,
        servername: dbHostname // Required for SNI
      },
      application_name: 'learn-logbook-test',
      // Add timeouts
      connectionTimeoutMillis: 10000, // 10 seconds
      query_timeout: 5000, // 5 seconds
      statement_timeout: 5000 // 5 seconds
    });

    console.log('Connecting to database...');

    // Wrap connection in a timeout promise
    const connectWithTimeout = async () => {
      return Promise.race([
        client!.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
        )
      ]);
    };

    await connectWithTimeout();
    console.log('Successfully connected to database!');

    // Test simple query with timeout
    console.log('\nTesting simple query...');
    const result = await client.query('SELECT current_database() as db, current_user as user');
    console.log('Database info:', result.rows[0]);

    // Test table access with timeout
    console.log('\nTesting table access...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log('Available tables:', tablesResult.rows.map(row => row.table_name));

    await client.end();
    console.log('\nConnection test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\nConnection test failed:', error);
    if (error.message.includes('timeout')) {
      console.error('Connection or query timed out. Please check database availability and network conditions.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Please check if the database is accepting connections.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('DNS resolution failed. Please check the hostname.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timed out. Please check your network connection and firewall settings.');
    } else if (error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
      console.error('SSL certificate verification failed. Check SSL configuration.');
    }
    if (client) {
      try {
        await client.end();
      } catch (endError) {
        console.error('Error closing client:', endError);
      }
    }
    process.exit(1);
  }
}

testConnection();
