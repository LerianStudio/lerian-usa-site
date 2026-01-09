import { Star } from "lucide-react";

interface TopRatedBadgeProps {
  rating: number;
  threshold?: number;
}

export function TopRatedBadge({ rating, threshold = 4.5 }: TopRatedBadgeProps) {
  if (rating < threshold) return null;

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 border border-primary">
      <Star className="h-3 w-3 fill-primary text-primary" />
      <span className="text-xs font-medium text-primary">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
