'use client';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SOCKET_URL ?
  process.env.NEXT_PUBLIC_SOCKET_URL :
  'http://localhost:4000';

let _socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === 'undefined') return null;

  if (!_socket || _socket.disconnected) {
    _socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    _socket.on('connect', () =>
      console.log('[socket] connected:', _socket?.id)
    );
    _socket.on('disconnect', (reason) =>
      console.log('[socket] disconnected:', reason)
    );
    _socket.on('connect_error', (err) =>
      console.warn('[socket] connection error:', err.message)
    );
  }

  return _socket;
}

export function joinRoom(roomId: string) {
  getSocket()?.emit('join_room', roomId);
}

export function leaveRoom(roomId: string) {
  getSocket()?.emit('leave_room', roomId);
}

export function disconnectSocket() {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
}
