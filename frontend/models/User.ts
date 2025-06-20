// models/User.ts
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String },
  walletAddress: { type: String, unique: true },
  totalScore: { type: Number, default: 0 },
  quizCount: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
