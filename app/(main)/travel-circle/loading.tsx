import PostCardSkeleton from "@/components/feed/PostCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function TravelCircleLoading() {
  return (
    <div className="bg-[#fafcf8]">
      <div className="mx-auto flex max-w-[960px] flex-1 flex-col px-4 py-5 sm:px-10">
        <div className="mb-4">
          <p className="text-[32px] font-bold tracking-light text-[#151b0e]">Social Feed</p>
          <p className="text-sm text-[#76974e]">Discover and share your Marrakech adventures.</p>
        </div>

        <div className="flex flex-wrap gap-3 p-3">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>

        <div className="space-y-6 py-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </div>
    </div>
  );
}