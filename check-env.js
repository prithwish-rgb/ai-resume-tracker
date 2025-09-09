// Simple environment check script
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking environment setup...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file found');
  
  // Read and check contents
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  console.log(`📝 Found ${lines.length} environment variables:`);
  lines.forEach(line => {
    const [key] = line.split('=');
    console.log(`   - ${key}`);
  });
  
  // Check for required variables
  const required = ['MONGODB_URI', 'NEXTAUTH_SECRET'];
  const missing = required.filter(key => !envContent.includes(key));
  
  if (missing.length === 0) {
    console.log('✅ All required environment variables are set');
  } else {
    console.log('❌ Missing required variables:', missing.join(', '));
  }
} else {
  console.log('❌ .env.local file not found');
  console.log('📝 Please create .env.local with:');
  console.log('   MONGODB_URI=your-mongodb-connection-string');
  console.log('   NEXTAUTH_SECRET=your-secret-key');
}

console.log('\n🚀 To test the app:');
console.log('   1. npm run dev');
console.log('   2. Visit http://localhost:3000');
console.log('   3. Test database: http://localhost:3000/api/test-db');
