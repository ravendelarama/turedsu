import { getPostUserByUsername } from "@/actions/user";
import { PostItemHoverCard } from "./post";
import { useQuery } from "@tanstack/react-query";

export default function UsernameCaptionWrapper({
  username,
}: {
  username: string;
}) {
  const { data } = useQuery({
    queryKey: ["username", username],
    queryFn: async () => {
      return await getPostUserByUsername(username);
    },
  });
  if (data) {
    return <PostItemHoverCard type="caption" user={data!} />;
  }
  return null;
}
