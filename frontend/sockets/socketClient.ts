// sockets/socketClient.ts
import { io, Socket } from "socket.io-client";

let socket: Socket;

export const initiateSocket = () => {
  if (!socket) {
    socket = io({
      path: "/api/socket_io",
    });
    console.log("📡 Connected to socket");
  }
  return socket;
};

export const getSocket = () => socket;
