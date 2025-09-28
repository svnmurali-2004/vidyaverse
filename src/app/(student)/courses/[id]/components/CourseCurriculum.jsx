import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Lock } from "lucide-react";

export default function CourseCurriculum({ course, lessons, courseId, isEnrolled }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Course Content</CardTitle>
        <CardDescription>
          {lessons.length} lessons • {course.duration || "Self-paced"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {lessons.map((lesson, index) => (
            <div
              key={lesson._id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-4"
            >
              <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 mt-0.5 sm:mt-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm sm:text-base line-clamp-1 sm:line-clamp-none">
                    {lesson.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1">
                    {lesson.description}
                  </p>
                  <div className="flex items-center space-x-3 sm:space-x-4 mt-1 sm:mt-2 text-xs text-gray-500">
                    <span className="capitalize">{lesson.type}</span>
                    {lesson.duration && <span>{lesson.duration} min</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 self-start sm:self-center">
                {lesson.isPreview ? (
                  <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
                    <Link
                      href={`/courses/${courseId}/learn?lesson=${lesson._id}&preview=true`}
                    >
                      <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Preview
                    </Link>
                  </Button>
                ) : isEnrolled ? (
                  <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
                    <Link href={`/courses/${courseId}/learn?lesson=${lesson._id}`}>
                      <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Start
                    </Link>
                  </Button>
                ) : (
                  <div className="flex items-center text-gray-400 text-xs sm:text-sm">
                    <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Locked
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}