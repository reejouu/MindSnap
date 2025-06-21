// sockets/types.ts
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import type { Server as IOServer } from "socket.io";

export type NextApiResponseWithSocket = {
  socket: NetSocket & {
    server: HTTPServer & {
      io: IOServer;
    };
  };
};

export interface BattleSocketEvents {
  join_battle: { battleId: string; username: string };
  question_answered: { battleId: string; user: string; questionId: string; isCorrect: boolean };
  submit_score: { battleId: string; user: string; score: number };
  end_battle: { battleId: string; winner: string };
  opponent_joined: { username: string };
  opponent_answered: { user: string; questionId: string; isCorrect: boolean };
  opponent_score: { user: string; score: number };
  battle_ended: { winner: string };
}
