import Battle from "@/models/Battle";
import dbConnect from "@/lib/mongodb";

interface User {
  id: string;
  name: string;
}

interface Player {
  userId: string;
  username: string;
  score?: number;
}

// 1. Create new battle
export async function createBattle(topic: string, user: User) {
  await dbConnect();
  const battle = await Battle.create({
    topic,
    players: [{ userId: user.id, username: user.name }],
  });
  return battle;
}

// 2. Join an existing waiting battle
export async function joinBattle(battleId: string, user: User) {
  await dbConnect();
  const battle = await Battle.findById(battleId);

  if (!battle || battle.status !== "waiting") return null;

  battle.players.push({ userId: user.id, username: user.name });
  battle.status = "active";
  await battle.save();

  return battle;
}

// 3. Submit quiz score
export async function submitScore(battleId: string, userId: string, score: number) {
  await dbConnect();
  const battle = await Battle.findById(battleId);
  if (!battle) return null;

  const player = battle.players.find((p: Player) => p.userId === userId);
  if (player) {
    player.score = score;
  }

  // Optional: check if both players have submitted
  const allSubmitted = battle.players.length === 2 && battle.players.every((p: Player) => p.score && p.score > 0);

  if (allSubmitted) {
    const [p1, p2] = battle.players;
    if (p1.score && p2.score) {
      if (p1.score > p2.score) battle.winnerId = p1.userId;
      else if (p2.score > p1.score) battle.winnerId = p2.userId;
      else battle.winnerId = "draw";
    }

    battle.status = "finished";
  }

  await battle.save();
  return battle;
}

// 4. Get battle status
export async function getBattle(battleId: string) {
  await dbConnect();
  return await Battle.findById(battleId);
}
