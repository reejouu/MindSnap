import { NextApiRequest } from "next";
import { Server as HTTPServer } from "http";
import { Socket } from "net";
import { Server as IOServer } from "socket.io";

export interface NextApiRequestWithSocket extends NextApiRequest {
  socket: Socket & {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
}
