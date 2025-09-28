import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function CourseOverview({ course }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Course Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">About This Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose max-w-none dark:prose-invert text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />
        </CardContent>
      </Card>

      {/* Course Requirements */}
      {course.requirements && course.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {course.requirements.map((req, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Learning Outcomes */}
      {course.learningOutcomes && course.learningOutcomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">What You'll Learn</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {course.learningOutcomes.map((outcome, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">{outcome}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}