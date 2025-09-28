import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Play, BookOpen, Clock, Star, ChevronRight, Award, TrendingUp } from 'lucide-react';

const RecentCourseCard = ({ enrollment }) => {
  const { course, progressPercentage } = enrollment;
  
  return (
    <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      <CardContent className="p-0">
        {/* Course Image Header */}
        <div className="relative h-32 overflow-hidden">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-primary/60" />
            </div>
          )}
          
          {/* Progress Overlay */}
          <div className="absolute top-3 right-3">
            {progressPercentage >= 100 ? (
              <div className="bg-green-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                <Award className="h-3 w-3" />
                Complete
              </div>
            ) : progressPercentage > 0 ? (
              <div className="bg-blue-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                <TrendingUp className="h-3 w-3" />
                {progressPercentage}%
              </div>
            ) : (
              <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                New
              </div>
            )}
          </div>
          
          {/* Level Badge */}
          <div className="absolute top-3 left-3">
            <Badge 
              variant="secondary" 
              className="bg-white/90 dark:bg-black/90 text-gray-800 dark:text-gray-200 backdrop-blur-sm"
            >
              {course.level || 'Beginner'}
            </Badge>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        
        {/* Course Content */}
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
              {course.title}
            </h3>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <Star className="h-3 w-3 mr-1 text-yellow-500" />
                {course.instructor?.name || 'Instructor'}
              </span>
              {course.duration && (
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {Math.round(course.duration / 60)}h
                </span>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Progress
              </span>
              <span className="text-xs font-bold text-primary">
                {progressPercentage || 0}%
              </span>
            </div>
            <div className="relative">
              <Progress value={progressPercentage || 0} className="h-2" />
              <div 
                className="absolute top-0 left-0 h-2 bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage || 0}%` }}
              />
            </div>
          </div>
          
          {/* Action Button */}
          <Button 
            asChild 
            className="w-full group/button bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 transition-all duration-300"
            size="sm"
          >
            <Link href={`/courses/${course._id}/learn`} className="flex items-center justify-center gap-2">
              <Play className="h-4 w-4 group-hover/button:scale-110 transition-transform" />
              <span className="font-medium">
                {progressPercentage > 0 ? 'Continue Learning' : 'Start Course'}
              </span>
              <ChevronRight className="h-4 w-4 group-hover/button:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const FeaturedCourseCard = ({ enrollment }) => {
  const { course, progressPercentage } = enrollment;
  
  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5 dark:from-primary/10 dark:via-blue-500/10 dark:to-purple-500/10">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-2">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                by {course.instructor?.name || 'Instructor'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4 text-xs">
              <Badge className="bg-gradient-to-r from-primary to-blue-500 text-white">
                {course.level || 'Beginner'}
              </Badge>
              {course.duration && (
                <span className="flex items-center text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {Math.round(course.duration / 60)} hours
                </span>
              )}
              <span className="flex items-center text-gray-500">
                <Star className="h-3 w-3 mr-1 text-yellow-500" />
                Featured
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {progressPercentage >= 100 ? 'Completed!' : 
                   progressPercentage > 0 ? `${progressPercentage}% Complete` : 'Ready to start'}
                </span>
                {progressPercentage >= 100 && (
                  <Award className="h-4 w-4 text-green-500" />
                )}
              </div>
              <Progress value={progressPercentage || 0} className="h-3" />
            </div>
            
            <Button 
              asChild 
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href={`/courses/${course._id}/learn`} className="flex items-center justify-center gap-3">
                <Play className="h-5 w-5" />
                <span>{progressPercentage > 0 ? 'Continue Learning' : 'Start Your Journey'}</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RecentCourseSkeleton = () => (
  <Card className="shadow-md">
    <CardContent className="p-0">
      <div className="space-y-0">
        <Skeleton className="h-32 w-full rounded-t-lg" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-5 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const EmptyState = () => (
  <div className="col-span-full">
    <div className="text-center py-12 px-4">
      <div className="relative mx-auto w-32 h-32 mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full animate-pulse"></div>
        <div className="absolute inset-4 bg-gradient-to-br from-primary/30 to-blue-500/30 rounded-full flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-primary" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Ready to start learning?
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Discover thousands of courses and start your learning journey today. From beginner to advanced, we have something for everyone.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Button asChild size="lg" className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-lg">
          <Link href="/courses" className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Browse All Courses
          </Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link href="/courses?filter=free" className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Try Free Courses
          </Link>
        </Button>
      </div>
      
      <div className="mt-8 flex justify-center space-x-8 text-center">
        <div>
          <div className="text-2xl font-bold text-primary">1000+</div>
          <div className="text-xs text-gray-500">Courses</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-500">Free</div>
          <div className="text-xs text-gray-500">Trial</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-500">24/7</div>
          <div className="text-xs text-gray-500">Support</div>
        </div>
      </div>
    </div>
  </div>
);

export default function RecentCoursesSection({ courses, loading }) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <RecentCourseSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return <EmptyState />;
  }

  // Show featured course if available (most progressed or most recent)
  const featuredCourse = courses.find(c => c.progressPercentage > 0) || courses[0];
  const remainingCourses = courses.filter(c => c._id !== featuredCourse._id).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Featured Course */}
      {featuredCourse && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {featuredCourse.progressPercentage > 0 ? 'Continue Your Journey' : 'Start Here'}
            </span>
          </div>
          <FeaturedCourseCard enrollment={featuredCourse} />
        </div>
      )}
      
      {/* Other Courses */}
      {remainingCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Your Other Courses
            </span>
            {courses.length > 4 && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/courses?enrolled=true" className="flex items-center gap-1 text-xs">
                  View All <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {remainingCourses.map((enrollment) => (
              <RecentCourseCard key={enrollment._id} enrollment={enrollment} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}