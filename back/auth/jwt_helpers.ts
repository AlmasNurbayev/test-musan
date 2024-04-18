import { config } from '../config';
import { JwtPayload } from '../shared/interfaces';
import jwt from 'jsonwebtoken';

export function generateAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, config.secret_jwt, { expiresIn: '1d' });
}

export function generateRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, config.secret_jwt, { expiresIn: '30d' });
}

export async function verifyToken(token: string) {
  return jwt.verify(token, config.secret_jwt) as JwtPayload;
}
