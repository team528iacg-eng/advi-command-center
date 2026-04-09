import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);

const ALLOWED_ORIGINS = [
  'https://advi-command-center.vercel.app',
  'http://localhost:3000',
  /\.vercel\.app$/,
  /\.up\.railway\.app$/,
];

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 10000,
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime(), connections: io.engine.clientsCount });
});

io.on('connection', (socket) => {
  console.log(`[+] connected: ${socket.id}`);

  // Client joins a room by spaceId (tasks) or conversationId (messages)
  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
    console.log(`    ${socket.id} joined: ${roomId}`);
  });

  socket.on('leave_room', (roomId: string) => {
    socket.leave(roomId);
  });

  // Task updated — broadcast to everyone in the space room EXCEPT the sender
  socket.on('task_updated', (data: {
    roomId: string;
    id: string;
    patch: Record<string, unknown>;
    userId: string;
  }) => {
    socket.to(data.roomId).emit('task_updated', data);
  });

  // Message sent — broadcast to conversation room EXCEPT sender
  socket.on('message_sent', (data: {
    roomId: string;
    message: Record<string, unknown>;
    userId: string;
  }) => {
    socket.to(data.roomId).emit('message_sent', data);
  });

  // Typing indicator
  socket.on('typing', (data: {
    roomId: string;
    userId: string;
    userName: string;
    isTyping: boolean;
  }) => {
    socket.to(data.roomId).emit('typing', data);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[-] disconnected: ${socket.id} (${reason})`);
  });
});

const PORT = Number(process.env.PORT) || 4000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[socket] server running on port ${PORT}`);
});
