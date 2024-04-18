import { Router, Response, Request, NextFunction } from 'express';
import { authJWT } from '../../middlewares/authJwt';
import passport from 'passport';

export function NotesController() {
  const router = Router();

  router.get(
    '/',
    // (req: Request, res: Response, next: NextFunction) => {
    //   validateSchema(req, res, next, AuthRegisterSchema);
    // },
    authJWT,
    (req: Request, res: Response, next: NextFunction) => {
      res.send('Hello notes');
    },
  );

  return router;
}
