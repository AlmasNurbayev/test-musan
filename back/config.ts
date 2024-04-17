import 'dotenv/config';

export const config = {
  secret_jwt: process.env.SECRET_JWT || 'secret_la_la',
  express_port: process.env.EXPRESS_PORT,
  express_port_external: process.env.EXPRESS_PORT_EXTERNAL,
  front_url: process.env.FRONT_URL,
};

export const configRedisUser = {
    port: 6379,
    host: "redis",
    password: process.env.REDIS_PASSWORD || 'password',
    db: 0,
}
