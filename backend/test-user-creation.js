const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function testUserCreation() {
  const testEmail = `testuser_${Date.now()}@test.com`;
  const testUsername = 'testuser_' + Date.now();
  const testPassword = 'TestPassword123';

  console.log('\n=== TESTING USER CREATION AND DATABASE STORAGE ===\n');
  console.log(`Test Email: ${testEmail}`);
  console.log(`Test Username: ${testUsername}\n`);

  try {
    // Step 1: Register user via API
    console.log('Step 1: Registering user via API...');
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
    console.log(`Response: ${JSON.stringify(registerData, null, 2)}\n`);

    if (!registerData.success) {
      console.error('❌ Registration failed!');
      return;
    }

    const userId = registerData.user.id;
    console.log(`✓ User registered successfully with ID: ${userId}\n`);

    // Step 2: Connect to MongoDB and verify user exists
    console.log('Step 2: Connecting to MongoDB and verifying user storage...');
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'mergeconflicts';

    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env');
      return;
    }

    console.log(`MongoDB URI: ${mongoUri}`);
    console.log(`Database: ${dbName}\n`);

    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log('✓ Connected to MongoDB\n');

    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Query user by email
    const user = await usersCollection.findOne({ email: testEmail });

    if (user) {
      console.log('✅ USER FOUND IN DATABASE!\n');
      console.log('User Document:');
      console.log(JSON.stringify({
        _id: user._id,
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        songsUploaded: user.songsUploaded,
        hasPasswordHash: !!user.passwordHash
      }, null, 2));

      console.log('\n=== DATABASE VERIFICATION PASSED ✅ ===');
      console.log(`User '${testEmail}' successfully stored in MongoDB database.`);
      console.log(`Fields verified: id, email, username, createdAt, songsUploaded, passwordHash\n`);
    } else {
      console.log('❌ USER NOT FOUND IN DATABASE!');
      console.log('Checking all users in database...');
      const allUsers = await usersCollection.find({}).toArray();
      console.log(`Total users in database: ${allUsers.length}`);
      if (allUsers.length > 0) {
        console.log('Recent users:', allUsers.slice(-3).map(u => ({ email: u.email, id: u.id })));
      }
    }

    await client.close();
    console.log('\n✓ MongoDB connection closed\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testUserCreation();
