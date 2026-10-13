import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest } from '@jest/globals';
import mongoose from 'mongoose';

jest.setTimeout(30000);

// Set required env vars for tests
process.env.JWT_SECRET = 'test-jwt-secret-key-for-jest';
process.env.JWT_EXPIRE = '1h';
process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'https://blogcraft-ai.onrender.com,http://localhost:3000';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
