import { MapPin } from "lucide-react";
import type { Poster } from "@/lib/types";
import { Avatar } from "@/components/Avatar";
import { PostedAgo } from "@/components/TimeText";

/** Avatar + name + "Posted Xh ago" with distance on the right (item detail). */
export function PosterRow({ poster, postedAt }: { poster: Poster; postedAt: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar src={poster.avatar} name={poster.name} size={36} />
      <div className="min-w-0 flex-1">
        <p className="text-body-medium text-ink leading-tight">{poster.name}</p>
        <p className="text-caption text-ink-subtle">
          <PostedAgo iso={postedAt} />
        </p>
      </div>
      <span className="text-caption text-ink-subtle inline-flex items-center gap-1">
        <MapPin size={13} aria-hidden /> {poster.distanceMi} miles away
      </span>
    </div>
  );
}
