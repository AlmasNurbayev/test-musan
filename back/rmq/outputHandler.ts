import { config } from '../config';
import { ResponseHTTP } from '../shared/interfaces';
import { Logger } from '../shared/logger';
import { channelOutput } from './rmqInit';

export async function outputHandler(data: ResponseHTTP) {
  try {
    console.log('sended answer', data);

    channelOutput.sendToQueue(
      config.rmq.output_queue,
      // !!! для @nest/microservices надо данные обернуть в объект с:
      // - pattern (нужен Nest для маршрутизации)
      // - data с нужными данными
      // если же отправляем не в Nest - то можно {pattern, data} убрать и передавать сразу
      Buffer.from(
        JSON.stringify({
          pattern: 'notes:processed',
          data: data,
        }),
      ),

      {
        persistent: true,
      },
    );
  } catch (error) {
    Logger.error('output RMQ', error);
  }
}
