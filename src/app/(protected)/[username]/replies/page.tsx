import { auth } from "@/lib/auth";

export default async function RepliesPage() {
  const session = await auth();
  return <div>Replies Page {JSON.stringify(session, null, 4)}</div>;
}
