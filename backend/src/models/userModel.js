const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * User Model
 * Handles user data persistence in JSON database
 * Located at: /data/user-db.json (shared between components)
 */

const userDbPath = path.join(__dirname, '..', '..', '..', 'data', 'user-db.json');

/**
 * Ensure users database file exists
 */
const ensureUsersDatabase = () => {
  const dir = path.dirname(userDbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(userDbPath)) {
    const initialData = {
      users: []
    };
    fs.writeFileSync(userDbPath, JSON.stringify(initialData, null, 2));
  }
};

/**
 * Read all users from database
 */
const getAllUsers = async () => {
  try {
    ensureUsersDatabase();
    const data = fs.readFileSync(userDbPath, 'utf-8');
    const { users } = JSON.parse(data);
    return users || [];
  } catch (error) {
    console.error('Error reading users database:', error);
    return [];
  }
};

/**
 * Get user by email
 */
const getUserByEmail = async (email) => {
  try {
    const users = await getAllUsers();
    return users.find((user) => user.email === email);
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  try {
    const users = await getAllUsers();
    return users.find((user) => user.id === userId);
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
};

/**
 * Create new user
 */
const createUser = async (userData) => {
  try {
    ensureUsersDatabase();
    const users = await getAllUsers();

    // Check if user already exists
    const existingUser = users.find((u) => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: uuidv4(),
      email: userData.email,
      username: userData.username || userData.email.split('@')[0],
      passwordHash: userData.passwordHash, // Already hashed by controller
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      songsUploaded: 0,
      lastLogin: null
    };

    users.push(newUser);
    fs.writeFileSync(userDbPath, JSON.stringify({ users }, null, 2));

    return {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      createdAt: newUser.createdAt
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update user (for login tracking, etc)
 */
const updateUser = async (userId, updates) => {
  try {
    ensureUsersDatabase();
    const users = await getAllUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(userDbPath, JSON.stringify({ users }, null, 2));
    return users[userIndex];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Delete user
 */
const deleteUser = async (userId) => {
  try {
    ensureUsersDatabase();
    const users = await getAllUsers();
    const filteredUsers = users.filter((u) => u.id !== userId);

    fs.writeFileSync(userDbPath, JSON.stringify({ users: filteredUsers }, null, 2));
    return { success: true, message: 'User deleted' };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Increment songs uploaded count
 */
const incrementSongsUploaded = async (userId) => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await updateUser(userId, {
      songsUploaded: (user.songsUploaded || 0) + 1
    });
  } catch (error) {
    console.error('Error incrementing songs uploaded:', error);
    throw error;
  }
};

module.exports = {
  ensureUsersDatabase,
  getAllUsers,
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  incrementSongsUploaded
};
