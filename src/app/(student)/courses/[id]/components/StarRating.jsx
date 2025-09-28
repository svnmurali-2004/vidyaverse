import { Star } from "lucide-react";

export default function StarRating({ rating, size = "h-4 w-4" }) {
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${size} ${
            i < Math.floor(rating)
              ? "text-yellow-400 fill-current"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}