import { Prisma, PrismaClient } from '@prisma/client';
import { config } from '../../config';
import { notesNotFound } from '../../middlewares/exceptions/notes.exceptions';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { NotesCreateType } from './schemas/notes_create.schema';
import { NotesUpdateType } from './schemas/notes_update.schema';

type notesWhereInput = Prisma.NotesWhereInput;

export class NotesService {
  constructor(
    private redisNotesCache = config.redisNotesCache,
    private repository = new PrismaClient().notes,
  ) {}

  async create(body: NotesCreateType, user_id: number) {
    const { title, data, published } = body;
    const newNote = await this.repository.create({
      data: {
        title,
        data,
        published,
        user_id,
      },
    });
    this.redisNotesCache.client.set(
      String(newNote.id),
      JSON.stringify(newNote),
      'EX',
      60 * 60 * 24, // 1d);
    );
    return {
      error: false,
      statusCode: 201,
      message: 'note created',
      data: newNote,
    };
  }

  async list(query: ParsedQs) {
    const { take, skip, searchTitle } = query;

    const where: notesWhereInput = {};
    if (searchTitle) {
      where.title = {
        contains: String(searchTitle),
      };
    }
    const notes = await this.repository.findMany({
      where,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });
    const count = await this.repository.count({ where });
    return {
      error: false,
      statusCode: 200,
      message: 'notes list',
      data: {notes, count},
    };
  }

  async getById(params: ParamsDictionary) {
    const { id } = params;

    const noteInCache = await this.redisNotesCache.client.get(String(id));
    if (noteInCache) {
      return {
        error: false,
        statusCode: 200,
        message: 'note',
        data: JSON.parse(noteInCache),
      };
    }

    const note = await this.repository.findUnique({
      where: { id: Number(id) },
    });
    if (!note) {
      return notesNotFound;
    }
    return {
      error: false,
      statusCode: 200,
      message: 'note',
      data: note,
    };
  }

  async update(id: number, body: NotesUpdateType) {
    const isExist = await this.repository.findUnique({
      where: { id: Number(id) },
    });
    if (!isExist) {
      return notesNotFound;
    }

    const updatedNote = await this.repository.update({
      where: { id: Number(id) },
      data: body,
    });
    if (!updatedNote) {
      return notesNotFound;
    }
    this.redisNotesCache.client.set(
      String(id),
      JSON.stringify(updatedNote),
      'EX',
      60 * 60 * 24, // 1d
    );
    return {
      error: false,
      statusCode: 200,
      message: 'updated note',
      data: updatedNote,
    };
  }

  async delete(id: number) {
    const isExist = await this.repository.findUnique({
      where: { id: Number(id) },
    });
    if (!isExist) {
      return notesNotFound;
    }
    const deletedNote = await this.repository.delete({
      where: { id: Number(id) },
    });
    if (!deletedNote) {
      return notesNotFound;
    }
    this.redisNotesCache.client.del(String(id));
    return {
      error: false,
      statusCode: 200,
      message: 'deleted note',
      data: deletedNote,
    };
  }
}
