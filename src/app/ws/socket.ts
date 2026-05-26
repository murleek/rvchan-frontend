import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const createSocket = (token: string) => {
  socket = io(import.meta.env.VITE_WS_URL, {
    auth: { token },
    transports: ["websocket"],
  });

  return socket;
};

export const getSocket = () => socket;

export const closeSocket = () => {
  socket?.disconnect();
  socket = null;
};
