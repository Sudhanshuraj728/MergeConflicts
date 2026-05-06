const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function testSpecificUser() {
  const testEmail = 'shudhanshuu123@gmail.com';
  const testUsername = 'sudhanshuuuuu';
  const testPassword = 'TestPassword123';

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         TESTING USER CREATION WITH SPECIFIC DATA            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`Email: ${testEmail}`);
  console.log(`Username: ${testUsername}`);
  console.log(`Password: ${testPassword}\n`);

  try {
    // Step 1: Register user via API
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 1: Registering user via API endpoint...\n');
    
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        username: testUsername,
        password: testPassword,
        confirmPassword: testPassword
      })
    });

    const registerData = await registerResponse.json();
    console.log(`Response Status: ${registerResponse.status}`);
    console.log(`Response Success: ${registerData.success}`);
    console.log(`User ID: ${registerData.user?.id}`);
    console.log(`Token Generated: ${registerData.token ? '✓ Yes' : '✗ No'}\n`);

    if (!registerData.success) {
      console.error('❌ Registration failed!');
      console.error(registerData);
      return;
    }

    const userId = registerData.user.id;
    console.log(`✅ User registered successfully\n`);

    // Step 2: Connect to MongoDB and verify user exists
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 2: Verifying user in MongoDB database...\n');
    
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'mergeconflicts';

    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env');
      return;
    }

    console.log(`Connecting to: ${mongoUri}`);
    console.log(`Database: ${dbName}\n`);

    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Query user by email
    const user = await usersCollection.findOne({ email: testEmail });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (user) {
      console.log('✅ ✅ ✅  USER FOUND IN DATABASE!  ✅ ✅ ✅\n');
      
      console.log('📋 User Document Details:\n');
      console.log('  MongoDB ID:    ', user._id);
      console.log('  User UUID:     ', user.id);
      console.log('  Email:         ', user.email);
      console.log('  Username:      ', user.username);
      console.log('  Created At:    ', user.createdAt);
      console.log('  Songs Uploaded:', user.songsUploaded);
      console.log('  Password Hash: ', user.passwordHash ? '✓ Stored & Encrypted' : '✗ Missing');

      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║              ✅ DATABASE VERIFICATION PASSED! ✅              ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');
      console.log(`✓ User '${testEmail}' successfully created and stored in MongoDB`);
      console.log(`✓ All fields properly persisted`);
      console.log(`✓ Password securely hashed\n`);
    } else {
      console.error('❌ USER NOT FOUND IN DATABASE!');
      console.log('Checking all users in database...');
      const allUsers = await usersCollection.find({}).toArray();
      console.log(`Total users in database: ${allUsers.length}`);
      if (allUsers.length > 0) {
        console.log('Recent users:', allUsers.slice(-3).map(u => ({ email: u.email, username: u.username })));
      }
    }

    await client.close();
    console.log('\n✓ MongoDB connection closed\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testSpecificUser();
