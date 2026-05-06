const { MongoClient } = require('mongodb');

let clientPromise = null;

const getMongoUri = () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  return uri;
};

const getDatabaseName = () => process.env.MONGODB_DB_NAME || 'mergeconflicts';

const connectToDatabase = async () => {
  if (!clientPromise) {
    const client = new MongoClient(getMongoUri());
    clientPromise = client.connect();
  }

  return clientPromise;
};

const getDatabase = async () => {
  const client = await connectToDatabase();
  return client.db(getDatabaseName());
};

const initializeDatabase = async () => {
  const db = await getDatabase();

  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('songs').createIndex({ id: 1 }, { unique: true }),
  ]);

  return db;
};

module.exports = {
  connectToDatabase,
  getDatabase,
  initializeDatabase,
};
