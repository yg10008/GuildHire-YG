import { config } from 'dotenv';
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import Chat from './models/chat.model.js';
import User from './models/user.model.js';
import Recruiter from './models/recruiter.model.js';

import userRouter from './routes/user.routes.js';
import jobRouter from './routes/job.routes.js';
import recruiterRouter from './routes/recruiter.routes.js';
import applicationRouter from './routes/application.routes.js';
import chatRouter from './routes/chat.routes.js';
import resumeScoreRouter from './routes/resume.routes.js';

config();

const app = express();
const server = http.createServer(app);

// Configure allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://job-sphere-ai.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error: No token provided'));
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch the actual user/recruiter data
    let userData = null;
    if (decoded.model === 'User') {
      userData = await User.findById(decoded._id).select('name email');
    } else if (decoded.model === 'Recruiter') {
      userData = await Recruiter.findById(decoded._id).select('name email companyName');
    }
    
    if (!userData) {
      return next(new Error('User/Recruiter not found'));
    }
    
    socket.user = {
      ...decoded,
      ...userData.toObject()
    };
    
    console.log('Socket authenticated for user:', socket.user);
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id, 'User:', socket.user.name || socket.user.email);

  socket.emit('userInfo', socket.user);

  socket.on('joinChat', async (chatId, callback) => {
    try {
      console.log('Attempting to join chat:', chatId, 'by user:', socket.user._id);
      
      const chat = await Chat.findById(chatId);
      if (!chat) {
        console.log('Chat not found:', chatId);
        return callback?.({ error: 'Chat not found' });
      }
      
      console.log('Chat participants:', chat.participants.map(p => ({ user: p.user.toString(), model: p.model })));
      
      const isParticipant = chat.participants.some(
        p => p.user.toString() === socket.user._id.toString() && p.model === socket.user.model
      );
      
      if (!isParticipant) {
        console.log('User not a participant. User ID:', socket.user._id, 'Model:', socket.user.model);
        return callback?.({ error: 'Unauthorized to join this chat' });
      }
      
      socket.join(chatId);
      console.log(`Socket ${socket.id} (${socket.user.name}) joined chat ${chatId}`);
      callback?.({ success: true });
    } catch (error) {
      console.error('Error joining chat:', error);
      callback?.({ error: 'Failed to join chat' });
    }
  });

  socket.on('sendMessageToRoom', ({ chatId, message }) => {
    console.log(`Broadcasting message from ${socket.user.name} to chat ${chatId}`);
    // This will send to all in the room except the sender
    socket.to(chatId).emit('receiveMessage', { chatId, message });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id, socket.user?.name || socket.user?.email);
    // Leave all rooms
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
        console.log(`Socket ${socket.id} left room ${room}`);
      }
    });
  });
});

app.locals.io = io;

// Configure CORS for Express
app.use(cors({
  origin: allowedOrigins,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Type'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads/resumes', express.static('uploads/resumes'));

// ROUTES
app.use('/users', userRouter);
app.use('/jobs', jobRouter);
app.use('/recruiters', recruiterRouter);
app.use('/applications', applicationRouter);
app.use('/chats', chatRouter);
app.use('/resume-scores', resumeScoreRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export { app, server };