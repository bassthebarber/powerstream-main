// backend/middleware/socketAuth.js

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('No token provided'));
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub || payload.id);
    if (!user) {
      return next(new Error('User not found for token'));
    }

    socket.user = {
      id: user._id.toString(),
      name: user.name,
      avatarUrl: user.avatarUrl
    };
    next();
  } catch (err) {
    console.error('Socket auth error:', err.message);
    next(new Error('Unauthorized'));
  }
};


