import RedisStore from 'connect-redis';
import 'dotenv/config';
import Redis from 'ioredis';

export const config = {
  secretJwt: process.env.SECRET_JWT || 'secret_la_la',
  expressPort: process.env.EXPRESS_PORT,
  expressPortExternal: process.env.EXPRESS_PORT_EXTERNAL,
  frontUrl: process.env.FRONT_URL,
  testUser: {
    name: process.env.TEST_USER_NAME || 'test',
    email: process.env.TEST_USER_EMAIL || 'test@test.com',
    password: process.env.TEST_USER_PASSWORD || 'T314passwordE!271',
  },
  auth: {
    confirmDelayMS: 1000 * 60, // 1 minute
  },
  notes: {
    rateLimitCreate: 3, // requests per minute
  },
  redisConfirms: {
    client: new Redis({
      port: 6379,
      host: 'redis',
      password: process.env.REDIS_PASSWORD || 'password',
      db: 0,
    }),
  },
  redisNotesCache: {
    client: new Redis({
      port: 6379,
      host: 'redis',
      password: process.env.REDIS_PASSWORD || 'password',
      db: 2,
    }),
  },
  redisSessions: {
    store: new RedisStore({
      client: new Redis({
        port: 6379,
        host: 'redis',
        password: process.env.REDIS_PASSWORD || 'password',
        db: 1,
      }),
      ttl: 60 * 60 * 24, // 1 day
    }),
    secret: process.env.SESSION_SECRET_KEY || 'secret',
    name: 'test-musan',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  },
};
