import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  rating: number
  count?: number
  size?: "sm" | "md"
  className?: string
}

export function FashionRatingStars({ rating, count, size = "sm", className }: Props) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5"

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating)
          const half = !filled && i < rating
          return (
            <Star
              key={i}
              className={cn(
                starSize,
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : half
                  ? "fill-yellow-200 text-yellow-400"
                  : "fill-muted text-muted-foreground"
              )}
            />
          )
        })}
      </div>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  )
}
