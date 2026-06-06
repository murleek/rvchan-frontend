import { useReactPostMutation } from "@/app/features/reaction/reaction.api";
import type { PublicPost } from "@/app/types/post";
import clsx from "clsx";
import { Heart } from "lucide-react";

const LikeButton: React.FC<{ thread: PublicPost }> = ({ thread }) => {
  const [react] = useReactPostMutation();

  const toggleLike = () => {
    react({ postId: thread.id });
  };

  return (
    <button
      className={clsx(
        "flex gap-1 items-center hover:cursor-pointer transition-[background-color] hover:bg-black/8 animated px-3 py-2 rounded-xl group/button color-muted-foreground ",
        thread.isLiked &&
          "bg-rose-600/12 hover:bg-rose-600/24! text-rose-600 liked",
      )}
      onClick={(e) => {
        e.preventDefault();
        toggleLike();
      }}
    >
      <Heart className="size-4.5 animated transition-[scale,fill,color] paint-order-[stroke] fill-transparent group-hover/button:fill-current group-active/button:scale-80 group-[.liked]/button:fill-current" />
      <span className="text-xs font-bold animated transition-[color] tabular-nums">
        {thread.likeCount}
      </span>
    </button>
  );
};

export default LikeButton;
