import CourseCard from "./CourseCard";
import { Award } from "lucide-react";

export default function FeaturedCourses({ 
  featuredCourses, 
  wishlist, 
  onToggleWishlist 
}) {
  if (featuredCourses.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Award className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Featured Courses
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredCourses.slice(0, 3).map((course) => (
          <CourseCard
            key={course._id}
            course={course}
            isFeatured={true}
            wishlist={wishlist}
            onToggleWishlist={onToggleWishlist}
          />
        ))}
      </div>
    </section>
  );
}