// backend/utils/generateToken.js
// TODO: Config normalized to env.js for consistency.
import jwt from 'jsonwebtoken';
import env from '../src/config/env.js';

const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

export default generateToken;
