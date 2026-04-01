#!/usr/bin/env node

/**
 * Phase 2 Deployment Validation Script
 * Checks if all Phase 2 files are in place and configured correctly
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

// Files that should exist
const REQUIRED_FILES = [
  // New files from Phase 2
  'src/lib/email.js',
  'src/lib/sentry.js',
  'src/app/verify-email/page.js',
  'src/app/api/auth/verify-email/route.js',
  'src/app/forgot-password/page.js',
  'src/app/reset-password/page.js',
  'src/app/api/auth/forgot-password/route.js',
  'src/app/api/auth/reset-password/route.js',
  'src/app/privacy/page.js',
  'src/app/terms/page.js',
  'src/components/common/SEOHead.js',
  'src/lib/seo.js',
  'SENTRY_SETUP.md',
  'PHASE_2_COMPLETE.md',
  '.env.example',
];

// Environment variables required
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SENTRY_DSN',  // Optional but recommended
  'NEXTAUTH_SECRET',          // Required
  'NEXTAUTH_URL',             // Required
  'DATABASE_URL',             // Required
];

// Functions
function checkFile(filePath) {
  const fullPath = path.join(ROOT, filePath);
  return fs.existsSync(fullPath);
}

function checkFileContent(filePath, searchString) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) return false;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  return content.includes(searchString);
}

function getFileSize(filePath) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) return 0;
  
  const stats = fs.statSync(fullPath);
  return stats.size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Main validation
console.log('\n🔍 Phase 2 Deployment Validation\n');
console.log('=' .repeat(50));

// 1. Check required files
console.log('\n📦 Checking Required Files...\n');

let filesOK = 0;
for (const file of REQUIRED_FILES) {
  const exists = checkFile(file);
  const size = getFileSize(file);
  const status = exists ? '✅' : '❌';
  const sizeStr = size > 0 ? ` (${formatBytes(size)})` : '';
  
  console.log(`${status} ${file}${sizeStr}`);
  if (exists) filesOK++;
}

console.log(`\n✓ Files: ${filesOK}/${REQUIRED_FILES.length}`);

// 2. Check for key functionality
console.log('\n🔌 Checking Key Features...\n');

const features = [
  {
    name: 'Email Verification API',
    file: 'src/app/api/auth/verify-email/route.js',
    content: 'verifyEmailToken'
  },
  {
    name: 'Password Reset API',
    file: 'src/app/api/auth/reset-password/route.js',
    content: 'validatePassword'
  },
  {
    name: 'Sentry Integration',
    file: 'src/lib/sentry.js',
    content: 'captureException'
  },
  {
    name: 'Email Templates',
    file: 'src/lib/email.js',
    content: 'emailTemplates'
  },
  {
    name: 'SEO Metadata',
    file: 'src/lib/seo.js',
    content: 'pageMetadata'
  },
  {
    name: 'Error Boundary Update',
    file: 'src/components/common/ErrorBoundary.js',
    content: 'captureException'
  },
  {
    name: 'Privacy Policy',
    file: 'src/app/privacy/page.js',
    content: 'GDPR'
  },
  {
    name: 'Terms of Service',
    file: 'src/app/terms/page.js',
    content: 'Terms of Service'
  },
];

let featuresOK = 0;
for (const feature of features) {
  const hasFeature = checkFileContent(feature.file, feature.content);
  const status = hasFeature ? '✅' : '❌';
  
  console.log(`${status} ${feature.name}`);
  if (hasFeature) featuresOK++;
}

console.log(`\n✓ Features: ${featuresOK}/${features.length}`);

// 3. Check environment template
console.log('\n⚙️  Checking Environment Variables...\n');

const envVarChecks = [
  {
    name: 'NEXT_PUBLIC_SENTRY_DSN',
    required: false
  },
  {
    name: 'NEXT_PUBLIC_APP_VERSION',
    required: false
  },
  {
    name: 'SENDGRID_API_KEY',
    required: false
  },
  {
    name: 'SMTP_HOST',
    required: false
  },
];

let envOK = 0;
for (const envVar of envVarChecks) {
  const inExample = checkFileContent('.env.example', envVar.name);
  const status = inExample ? '✅' : '❌';
  const req = envVar.required ? ' (required)' : ' (optional)';
  
  console.log(`${status} ${envVar.name}${req}`);
  if (inExample) envOK++;
}

console.log(`\n✓ Environment Variables: ${envOK}/${envVarChecks.length}`);

// 4. Code quality check
console.log('\n📊 Code Statistics...\n');

let totalLines = 0;
let totalSize = 0;

for (const file of REQUIRED_FILES) {
  if (file.endsWith('.md')) continue; // Skip markdown
  
  const size = getFileSize(file);
  if (size > 0) {
    totalSize += size;
    const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const lines = content.split('\n').length;
    totalLines += lines;
  }
}

console.log(`Lines of Code: ~${totalLines}`);
console.log(`Total Size: ${formatBytes(totalSize)}`);
console.log(`Average File Size: ${formatBytes(Math.round(totalSize / REQUIRED_FILES.length))}`);

// 5. Documentation check
console.log('\n📚 Documentation...\n');

const docs = [
  'SENTRY_SETUP.md',
  'PHASE_2_COMPLETE.md',
  'PHASE_2_QUICK_REFERENCE.md',
];

let docsOK = 0;
for (const doc of docs) {
  const exists = checkFile(doc);
  const size = getFileSize(doc);
  const status = exists ? '✅' : '⚠️ ';
  
  console.log(`${status} ${doc} (${formatBytes(size)})`);
  if (exists) docsOK++;
}

console.log(`\n✓ Documentation: ${docsOK}/${docs.length}`);

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📋 Summary\n');

const totalChecks = filesOK + featuresOK + envOK + docsOK;
const maxChecks = REQUIRED_FILES.length + features.length + envVarChecks.length + docs.length;

console.log(`✓ Total Checks Passed: ${totalChecks}/${maxChecks}`);
console.log(`✓ Completion: ${Math.round((totalChecks / maxChecks) * 100)}%`);

if (totalChecks === maxChecks) {
  console.log('\n🎉 Phase 2 Deployment Ready!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Review above.\n');
  process.exit(1);
}
