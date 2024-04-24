import amqp from 'amqplib';
import { Logger } from '../shared/logger';
import { NotesService } from '../modules/notes/notes.service';
import { outputHandler } from './outputHandler';

export async function inputHandler(msg: amqp.ConsumeMessage) {
  const notesService = new NotesService();
  const allData = JSON.parse(msg.content.toString());
  const data = allData.data;
  console.log('received allData', allData);

  if (allData.pattern === 'article_created') {
    try {
      const result = await notesService.create(
        {
          title: data.title,
          data: data.text,
        },
        4,
      );
      outputHandler(result);
    } catch (error) {
      Logger.error('input RMQ', error);
      outputHandler({
        data: { id: data.id },
        error: true,
        message: 'error on record this article',
        statusCode: 500,
      });
    }
  }
}
