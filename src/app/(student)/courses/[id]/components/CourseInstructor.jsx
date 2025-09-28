import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CourseInstructor({ course }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Instructor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
            <Image
              src={course.instructor?.image || "/default-avatar.png"}
              alt={course.instructor?.name || "Instructor"}
              width={80}
              height={80}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold">
              {course.instructor?.name || "Course Instructor"}
            </h3>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
              {course.instructor?.title || "Experienced Instructor"}
            </p>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {course.instructor?.bio ||
                "Experienced instructor with expertise in this field. Dedicated to helping students achieve their learning goals through practical, hands-on instruction and real-world examples."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}