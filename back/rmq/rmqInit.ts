import { config } from '../config';
import amqp from 'amqplib';
import { inputHandler } from './inputHandler';
import { Logger } from '../shared/logger';

export let channelInput: amqp.Channel;
export let channelOutput: amqp.Channel;

export async function rmqInit() {
  let connection: amqp.Connection;
  try {
    connection = await amqp.connect(config.rmq.url);
    process.once('SIGINT', async () => {
      console.log('got sigint, closing RMQ connection');
      await channelInput.close();
      await channelOutput.close();
      await connection.close();
      process.exit(0);
    });
    channelInput = await connection.createChannel();
    await channelInput.assertQueue(config.rmq.input_queue, { durable: true });
    await channelInput.consume(
      config.rmq.input_queue,
      async (msg) => {
        if (msg !== null) {
          await inputHandler(msg);
          channelInput.ack(msg);
        }
      },
      {
        noAck: false,
        consumerTag: 'back_consumer',
      },
    );
    channelOutput = await connection.createChannel();
    await channelOutput.assertQueue(config.rmq.output_queue, { durable: true });
    //await channelOutput.assertExchange('main', 'direct', { durable: false });
    Logger.info('RMQ connected');
  } catch (error) {
    Logger.error('rmqInit', error);
  }
}
