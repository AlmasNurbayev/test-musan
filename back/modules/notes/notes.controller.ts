import { Router, Response, Request, NextFunction } from 'express';
import { authJWT } from '../../middlewares/authJwt';
import { NotesCreateSchema } from './schemas/notes_create.schema';
import { validateSchema } from '../../middlewares/validateSchema';
import { NotesService } from './notes.service';
import { NotesIdSchema } from './schemas/notes_id.schema';
import { unauthorized } from '../../middlewares/exceptions/auth.exceptions';
import { NotesUpdateSchema } from './schemas/notes_update.schema';
import { Logger } from '../../shared/logger';
import { rateLimitNotesCreate } from '../../middlewares/rateLimiters/rate_limit.notes.create';

export function NotesController() {
  const router = Router();
  const notesService = new NotesService();

  router.post(
    '/',
    (req: Request, res: Response, next: NextFunction) => {
      validateSchema(req, res, next, NotesCreateSchema);
    },
    authJWT,
    rateLimitNotesCreate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user_id = req.session?.user?.id;
        if (!user_id) {
          return res.status(401).send(unauthorized);
        }
        const result = await notesService.create(req.body, user_id);
        res.status(result.statusCode).send(result);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    '/',
    (req: Request, res: Response, next: NextFunction) => {
      validateSchema(req, res, next, NotesCreateSchema);
    },
    authJWT,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await notesService.list(req.query);
        res.status(result.statusCode).send(result);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    '/:id',
    (req: Request, res: Response, next: NextFunction) => {
      validateSchema(req, res, next, NotesIdSchema);
    },
    authJWT,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await notesService.getById(req.params);
        res.status(result.statusCode).send(result);
      } catch (error) {
        next(error);
      }
    },
  );

  router.put(
    '/:id',
    (req: Request, res: Response, next: NextFunction) => {
      validateSchema(req, res, next, NotesUpdateSchema);
    },
    authJWT,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await notesService.update(Number(req.params.id), req.body);
        res.status(result.statusCode).send(result);
      } catch (error) {
        next(error);
      }
    },
  );

  router.delete(
    '/:id',
    (req: Request, res: Response, next: NextFunction) => {
      validateSchema(req, res, next, NotesIdSchema);
    },
    authJWT,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await notesService.delete(Number(req.params.id));
        res.status(result.statusCode).send(result);
      } catch (error) {
        next(error);
      }
    },
  );
  Logger.info('Notes controller mounted');

  return router;
}
