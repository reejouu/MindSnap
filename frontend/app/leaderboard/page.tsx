import { getUser } from "@civic/auth/nextjs";
import Leaderboard from "../../components/leaderboard";
import Link from "next/link";

export default async function LeaderboardPage() {
  const user = await getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in Required</h2>
          <p className="mb-4">Please click the sign-in button in the top right to access the dashboard.</p>
          <Link href="/" className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-primary/80 transition">Go to Home</Link>
        </div>
      </div>
    );
  }
  return <Leaderboard userName={user.name ?? ""} userEmail={user.email ?? ""} />;
}
