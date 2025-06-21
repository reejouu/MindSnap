import mongoose from "mongoose";

const BattleSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["waiting", "active", "finished"],
    default: "waiting",
  },
  players: [
    {
      userId: String,
      username: String,
      score: {
        type: Number,
        default: 0,
      },
    },
  ],
  quizQuestions: [
    {
      question: String,
      options: [String],
      answer: String,
    },
  ],
  winnerId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Optional: auto-delete stale battles after 1hr
  },
});

export default mongoose.models.Battle || mongoose.model("Battle", BattleSchema);
