import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function CoursePreview({ course, courseId, isEnrolled, lessons }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80">
        <Image
          src={course.thumbnail || "/placeholder-course.jpg"}
          alt={course.title}
          fill
          className="object-cover"
          priority
        />
        {!isEnrolled && lessons.length > 0 && lessons[0].isPreview && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <Button
              asChild
              size="lg"
              className="bg-white text-black hover:bg-gray-100 text-sm sm:text-base"
            >
              <Link
                href={`/courses/${courseId}/learn?lesson=${lessons[0]._id}&preview=true`}
              >
                <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                Preview Course
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}