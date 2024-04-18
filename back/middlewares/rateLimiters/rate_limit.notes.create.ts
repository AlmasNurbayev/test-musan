import rateLimit from 'express-rate-limit';
import { tooManyRequest } from '../exceptions/common.exceptions';
import { Logger } from '../../shared/logger';
import { config } from '../../config';

export const rateLimitNotesCreate = rateLimit({
  windowMs: 1 * 60 * 1000, // 1m
  max: config.notes.rateLimitCreate,
  keyGenerator: (req) => req.sessionID, // Используем ID сессии пользователя для идентификации
  handler: (req, res) => {
    Logger.warn('Too many requests ' + req.sessionID);
    res.status(429).send(tooManyRequest);
  },
});
