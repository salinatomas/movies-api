// node scripts/mongo/seedApiKeys.js

const crypto = require('crypto');

const MongoLib = require('../../lib/apiKeys.mongo');
const db = require('../../db');
const { config } = require('../../config');

const adminScopes = [
  'signin:auth',
  'signup:auth',
  'read:movies',
  'create:movies',
  'update:movies',
  'delete:movies',
  'read:user-movies',
  'create:user-movies',
  'delete:user-movies',
];

const publicScopes = [
  'signin:auth',
  'signup:auth',
  'read:movies',
  'read:user-movies',
  'create:user-movies',
  'delete:user-movies',
];

const apiKeys = [
  {
    token: generateRandomToken(),
    scopes: adminScopes,
  },
  {
    token: generateRandomToken(),
    scopes: publicScopes,
  },
];

function generateRandomToken() {
  const buffer = crypto.randomBytes(32);
  return buffer.toString('hex');
}

async function seedApiKeys() {
  const mongoDB = new MongoLib();

  try {
    const promises = apiKeys.map(async (apiKey) => {
      await mongoDB.create(apiKey);
    });

    await Promise.all(promises);
    console.log(`${promises.length} api keys have been created succesfully`); // prettier-ignore
    return process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

db(
  `mongodb://${config.dbUser}:${config.dbPassword}@cluster0-shard-00-00.lc6ir.mongodb.net:27017,cluster0-shard-00-01.lc6ir.mongodb.net:27017,cluster0-shard-00-02.lc6ir.mongodb.net:27017/${config.dbName}?ssl=true&replicaSet=atlas-djw3ne-shard-0&authSource=admin&retryWrites=true&w=majority`
);
seedApiKeys();
