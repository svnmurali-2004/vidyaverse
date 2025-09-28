import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFoundState() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <Card>
        <CardContent className="p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-4">
            The course you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}