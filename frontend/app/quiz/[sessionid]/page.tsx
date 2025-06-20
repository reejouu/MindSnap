import { getUser } from "@civic/auth/nextjs";
import QuizClientPage from "./QuizClientPage";

export default async function QuizPage() {
  const user = await getUser();
  return <QuizClientPage userName={user?.name ?? ""} />;
}
