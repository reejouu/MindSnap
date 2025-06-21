import { getUser } from "@civic/auth/nextjs";
import Leaderboard from "../../components/leaderboard";
import Link from "next/link";

export default async function LeaderboardPage() {
  const user = await getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 rounded-full flex items-center justify-center mb-4">
            {/* You can use a lock or user icon here for sign-in required */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75M3.75 10.5h16.5M6.75 10.5v7.125c0 1.243 1.007 2.25 2.25 2.25h5.25c1.243 0 2.25-1.007 2.25-2.25V10.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Sign in Required</h2>
          <p className="mb-4 text-gray-400">Please click the sign-in button in the top right to access the leaderboard.</p>
          <Link href="/" className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-primary/80 transition">Go to Home</Link>
        </div>
      </div>
    );
  }
  return <Leaderboard userName={user.name ?? ""} userEmail={user.email ?? ""} />;
}
