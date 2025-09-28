import { Badge } from "@/components/ui/badge";
import { User, Users, BookOpen } from "lucide-react";
import StarRating from "./StarRating";

export default function CourseHero({ course, lessons }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="text-xs sm:text-sm">
          {course.category}
        </Badge>
        <Badge variant="outline" className="text-xs sm:text-sm">
          {course.level}
        </Badge>
        {course.isFeatured && (
          <Badge className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm">
            Featured
          </Badge>
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
        {course.title}
      </h1>

      <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
        {course.shortDescription}
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{course.instructor?.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 flex-shrink-0" />
          <span>{course.enrollmentCount || 0} students</span>
        </div>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4" />
          <span>{lessons.length} lessons</span>
        </div>
        <div className="flex items-center space-x-1">
          <StarRating rating={course.avgRating || 0} />
          <span>({course.reviewCount || 0})</span>
        </div>
      </div>
    </div>
  );
}