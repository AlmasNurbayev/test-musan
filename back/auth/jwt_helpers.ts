import { config } from '../config';
import { JwtPayload } from '../shared/interfaces';
import jwt from 'jsonwebtoken';

export function generateAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, config.secretJwt, { expiresIn: '1d' });
}

export function generateRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, config.secretJwt, { expiresIn: '30d' });
}

export async function verifyToken(token: string) {
  return jwt.verify(token, config.secretJwt) as JwtPayload;
}
