import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CoursesLoading() {
  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Hero Section Skeleton */}
      <div className="text-center space-y-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-96 mx-auto animate-pulse"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-2xl mx-auto animate-pulse"></div>
      </div>

      {/* Featured Courses Skeleton */}
      <section className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-60 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Filters Skeleton */}
      <section className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-40 animate-pulse"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md max-w-md animate-pulse"></div>
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-44 animate-pulse"></div>
          ))}
        </div>
      </section>

      {/* Courses Grid Skeleton */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}