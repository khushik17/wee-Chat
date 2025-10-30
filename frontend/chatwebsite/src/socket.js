import { io } from "socket.io-client";

// ✅ CORRECT - Clean URL without trailing slash
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || "http://localhost:3000";

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'], // ✅ WebSocket first, then polling
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// Debug ke liye
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
  console.log("🔌 Connecting to:", SOCKET_URL);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error.message);
});

export default socket;