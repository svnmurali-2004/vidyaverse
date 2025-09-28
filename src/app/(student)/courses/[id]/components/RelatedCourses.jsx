import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function RelatedCourses({ relatedCourses }) {
  if (relatedCourses.length === 0) return null;

  return (
    <section className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Related Courses</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {relatedCourses.map((relatedCourse) => (
          <Card
            key={relatedCourse._id}
            className="hover:shadow-lg transition-shadow group"
          >
            <Link href={`/courses/${relatedCourse._id}`}>
              <div className="relative w-full h-32 overflow-hidden rounded-t-lg">
                <Image
                  src={relatedCourse.thumbnail || "/placeholder-course.jpg"}
                  alt={relatedCourse.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-medium line-clamp-2 mb-2 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                  {relatedCourse.title}
                </h3>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 truncate">
                    {relatedCourse.instructor?.name}
                  </span>
                  <span className="font-bold text-blue-600 flex-shrink-0 ml-2">
                    {relatedCourse.price === 0
                      ? "Free"
                      : `₹${relatedCourse.price}`}
                  </span>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}