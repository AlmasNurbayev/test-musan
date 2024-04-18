import RedisStore from 'connect-redis';
import 'dotenv/config';
import Redis from 'ioredis';

export const config = {
  secret_jwt: process.env.SECRET_JWT || 'secret_la_la',
  express_port: process.env.EXPRESS_PORT,
  express_port_external: process.env.EXPRESS_PORT_EXTERNAL,
  front_url: process.env.FRONT_URL,

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
