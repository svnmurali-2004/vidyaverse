import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function CoursesEmptyState({ 
  hasFilters, 
  onClearFilters 
}) {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No courses found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Try adjusting your filters to find more courses
        </p>
        <Button onClick={onClearFilters} variant="outline">
          Clear all filters
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No courses available
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Check back later for new courses
      </p>
    </div>
  );
}