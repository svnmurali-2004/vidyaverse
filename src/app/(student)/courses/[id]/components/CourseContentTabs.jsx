import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseOverview from "./CourseOverview";
import CourseCurriculum from "./CourseCurriculum";
import CourseInstructor from "./CourseInstructor";
import CourseReviews from "./CourseReviews";

export default function CourseContentTabs({ 
  course, 
  lessons, 
  courseId, 
  isEnrolled, 
  reviews 
}) {
  return (
    <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
      <div className="overflow-x-auto">
        <TabsList className="w-full sm:w-auto min-w-full sm:min-w-0 grid grid-cols-4 sm:inline-flex">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="text-xs sm:text-sm">
            Curriculum
          </TabsTrigger>
          <TabsTrigger value="instructor" className="text-xs sm:text-sm">
            Instructor
          </TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs sm:text-sm">
            Reviews
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview">
        <CourseOverview course={course} />
      </TabsContent>

      <TabsContent value="curriculum">
        <CourseCurriculum 
          course={course}
          lessons={lessons}
          courseId={courseId}
          isEnrolled={isEnrolled}
        />
      </TabsContent>

      <TabsContent value="instructor">
        <CourseInstructor course={course} />
      </TabsContent>

      <TabsContent value="reviews">
        <CourseReviews course={course} reviews={reviews} />
      </TabsContent>
    </Tabs>
  );
}