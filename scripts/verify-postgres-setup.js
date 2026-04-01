#!/usr/bin/env node

/**
 * ConsistencyGrid - PostgreSQL Migration Script
 * 
 * This script helps verify your PostgreSQL setup
 * Run with: node scripts/verify-postgres-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verifying PostgreSQL Setup for ConsistencyGrid\n');

// Check 1: Prisma schema updated
console.log('1️⃣  Checking Prisma schema...');
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf-8');

if (schema.includes('provider = "postgresql"')) {
  console.log('   ✅ Prisma configured for PostgreSQL');
} else {
  console.log('   ❌ ERROR: Prisma still configured for SQLite');
  console.log('   Fix: Update prisma/schema.prisma - change provider from "sqlite" to "postgresql"');
  process.exit(1);
}

// Check 2: Environment file exists
console.log('\n2️⃣  Checking environment configuration...');
const envProdPath = path.join(__dirname, '../.env.production');
const envLocalPath = path.join(__dirname, '../.env.local');

let envExists = false;
let envPath = null;

if (fs.existsSync(envProdPath)) {
  console.log('   ✅ .env.production file exists');
  envPath = envProdPath;
  envExists = true;
} else if (fs.existsSync(envLocalPath)) {
  console.log('   ✅ .env.local file exists');
  envPath = envLocalPath;
  envExists = true;
} else {
  console.log('   ⚠️  WARNING: No .env.production or .env.local file found');
  console.log('   Action: Create .env.production with DATABASE_URL and NEXTAUTH_SECRET');
}

// Check 3: Database URL configured
if (envExists && envPath) {
  console.log('\n3️⃣  Checking DATABASE_URL...');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  if (envContent.includes('DATABASE_URL')) {
    if (envContent.includes('postgresql://')) {
      console.log('   ✅ DATABASE_URL set with PostgreSQL connection');
    } else if (envContent.includes('file:')) {
      console.log('   ❌ ERROR: DATABASE_URL still points to SQLite');
      console.log('   Action: Update DATABASE_URL to point to PostgreSQL');
      process.exit(1);
    }
  } else {
    console.log('   ❌ ERROR: DATABASE_URL not set');
    console.log('   Action: Add DATABASE_URL=postgresql://... to .env.production');
    process.exit(1);
  }
  
  // Check 4: NEXTAUTH_SECRET
  console.log('\n4️⃣  Checking NEXTAUTH_SECRET...');
  if (envContent.includes('NEXTAUTH_SECRET') && !envContent.includes('NEXTAUTH_SECRET=your_')) {
    console.log('   ✅ NEXTAUTH_SECRET is configured');
  } else {
    console.log('   ⚠️  WARNING: NEXTAUTH_SECRET not properly configured');
    console.log('   Action: Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  }
}

// Check 5: Prisma Client generated
console.log('\n5️⃣  Checking Prisma Client...');
const prismaClientPath = path.join(__dirname, '../node_modules/.prisma/client');
if (fs.existsSync(prismaClientPath)) {
  console.log('   ✅ Prisma Client is generated');
} else {
  console.log('   ⚠️  WARNING: Prisma Client not generated');
  console.log('   Action: Run: npx prisma generate');
}

// Check 6: Dependencies
console.log('\n6️⃣  Checking dependencies...');
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

if (packageJson.dependencies && packageJson.dependencies['@prisma/client']) {
  console.log('   ✅ Prisma dependencies installed');
} else {
  console.log('   ❌ ERROR: Prisma not in dependencies');
  process.exit(1);
}

console.log('\n\n✅ Setup looks good! Next steps:\n');
console.log('1. Ensure DATABASE_URL in .env.production points to PostgreSQL');
console.log('2. Run: npx prisma migrate deploy');
console.log('3. Run: npx prisma generate');
console.log('4. Run: npm run dev');
console.log('5. Test signup at http://localhost:3000\n');

console.log('📚 Full guide: See POSTGRESQL_SETUP_GUIDE.md\n');
