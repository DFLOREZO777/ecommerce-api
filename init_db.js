const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: 'neondb', // Neon usually requires connecting directly to the assigned db
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

async function createDb() {
  try {
    await client.connect();
    console.log('Connecting to default postgres database...');
    
    const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${process.env.DB_NAME}'`);
    if (res.rowCount === 0) {
      console.log(`Database ${process.env.DB_NAME} not found, creating it automatically...`);
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`Database ${process.env.DB_NAME} created successfully!`);
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists.`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

createDb();
