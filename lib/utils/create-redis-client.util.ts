import Redis, { RedisOptions } from 'ioredis';

export const createRedisClient = async (redisOptions: RedisOptions) =>{
  const publisher = new Redis(redisOptions);
  const subscriber = publisher.duplicate();
  return { publisher,subscriber };
}
