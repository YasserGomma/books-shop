#!/usr/bin/env tsx

import { execSync } from 'child_process';
import postgres from 'postgres';
import { env } from '../src/config/env';

async function initDatabase() {
  console.log('🗄️  Initializing database...');

  try {
    // Extract database name from DATABASE_URL
    const dbUrl = new URL(env.DATABASE_URL);
    const dbName = dbUrl.pathname.slice(1); // Remove leading slash
    const baseUrl = `${dbUrl.protocol}//${dbUrl.username}:${dbUrl.password}@${dbUrl.host}`;

    console.log(`📋 Database name: ${dbName}`);

    // Connect to postgres database to check if our database exists
    const postgresDb = postgres(`${baseUrl}/postgres`);
    
    try {
      // Check if database exists
      const [result] = await postgresDb`
        SELECT 1 FROM pg_database WHERE datname = ${dbName}
      `;
      
      if (!result) {
        console.log(`📦 Creating database '${dbName}'...`);
        await postgresDb.unsafe(`CREATE DATABASE "${dbName}"`);
        console.log(`✅ Database '${dbName}' created successfully`);
      } else {
        console.log(`✅ Database '${dbName}' already exists`);
      }
    } finally {
      await postgresDb.end();
    }

    // Now connect to our actual database to check if it has tables
    const sql = postgres(env.DATABASE_URL);
    
    try {
      // Check if books table exists (indicating schema is set up)
      const [result] = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'books'
        );
      `;
      
      const tablesExist = result?.exists;

      if (!tablesExist) {
        console.log('📋 Running database migrations...');
        execSync('npm run db:migrate', { 
          cwd: process.cwd(), 
          stdio: 'inherit' 
        });
        console.log('✅ Database migrations completed');
      } else {
        console.log('✅ Database schema already exists');
      }

      // Check if there are any books (indicating data is seeded)
      const [countResult] = await sql`SELECT COUNT(*) as count FROM books`;
      const bookCount = parseInt(countResult?.count || '0');

      if (bookCount === 0) {
        console.log('🌱 Seeding database with multilingual data...');
        execSync('npm run db:seed-prod', { 
          cwd: process.cwd(), 
          stdio: 'inherit' 
        });
        console.log('✅ Database seeding completed');
      } else {
        console.log(`✅ Database already contains ${bookCount} books`);
      }

    } finally {
      await sql.end();
    }

    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('connection refused')) {
        console.error('🔌 Make sure PostgreSQL is running:');
        console.error('   brew services start postgresql');
        console.error('   # or #');
        console.error('   sudo systemctl start postgresql');
      } else if (error.message.includes('authentication failed')) {
        console.error('🔐 Check your DATABASE_URL credentials in .env file');
      } else if (error.message.includes('does not exist')) {
        console.error('🏗️  PostgreSQL service might not be installed');
        console.error('   brew install postgresql');
        console.error('   # or #');
        console.error('   sudo apt-get install postgresql');
      }
    }
    
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  initDatabase().catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

export { initDatabase };