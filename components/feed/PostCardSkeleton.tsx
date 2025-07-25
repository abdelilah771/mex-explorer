import { Skeleton } from "@/components/ui/skeleton"

export default function PostCardSkeleton() {
  return (
    <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm sm:p-6">
      <div className="flex w-full flex-row items-start justify-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex h-full flex-1 flex-col items-start justify-start space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="my-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="flex flex-wrap gap-4 px-4 py-2">
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}