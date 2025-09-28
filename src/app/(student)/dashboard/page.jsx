'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Users,
  Target,
  Award,
  Play,
  User,
  Settings,
  HelpCircle,
  Calendar,
  BarChart3,
  Bookmark,
  Bell,
  Search,
  ChevronRight,
  Star,
  CheckCircle
} from 'lucide-react';

// Lazy load heavy components
const QuickActionsGrid = dynamic(() => import('./components/QuickActionsGrid'), {
  loading: () => <QuickActionsSkeleton />,
  ssr: false
});

const RecentCoursesSection = dynamic(() => import('./components/RecentCoursesSection'), {
  loading: () => <RecentCoursesSkeleton />,
  ssr: false
});

// Enhanced skeleton components for loading states
const StatsSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="relative overflow-hidden border-0 bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <Skeleton className="h-4 w-[100px]" />
          <div className="p-2.5 rounded-xl bg-gray-200 dark:bg-gray-700">
            <Skeleton className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[60px] mb-2" />
          <Skeleton className="h-3 w-[120px] mb-3" />
          <div className="space-y-1">
            <div className="flex justify-between">
              <Skeleton className="h-2 w-[40px]" />
              <Skeleton className="h-2 w-[30px]" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const QuickActionsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-3 w-[160px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const RecentCoursesSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
    {[...Array(4)].map((_, i) => (
      <Card key={i}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[140px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
            <Skeleton className="h-2 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-[60px]" />
              <Skeleton className="h-8 w-[80px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function DashboardOptimized() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [stats, setStats] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // Redirect handling with early return
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'admin') {
      router.push('/admin');
      return;
    }

    if (status === 'authenticated') {
      setInitialLoading(false);
      fetchDashboardDataOptimized();
    }
  }, [session, status, router]);

  // Optimized data fetching with caching and error boundaries
  const fetchDashboardDataOptimized = async () => {
    try {
      setDataLoading(true);
      
      // Use AbortController for request cancellation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      // Fetch only essential data first
      const essentialPromises = [
        fetch('/api/dashboard/stats', { 
          signal: controller.signal,
          headers: { 'Cache-Control': 'public, max-age=300' } // 5min cache
        }),
        fetch('/api/dashboard/recent-courses', { 
          signal: controller.signal,
          headers: { 'Cache-Control': 'public, max-age=180' } // 3min cache
        })
      ];

      const [statsRes, coursesRes] = await Promise.all(essentialPromises);
      clearTimeout(timeoutId);

      // Handle responses with proper error checking
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log('📊 Raw stats response:', statsData);
        console.log('📊 Stats data:', statsData.data);
        setStats(statsData.data);
      } else {
        console.error('❌ Stats API error:', statsRes.status, statsRes.statusText);
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setRecentCourses(coursesData.data?.slice(0, 4) || []);
      }

      // Fetch non-essential data in background
      setTimeout(() => {
        fetchNonEssentialData();
      }, 100);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Error fetching dashboard data:', error);
        console.error('❌ Error details:', error.message, error.stack);
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setDataLoading(false);
    }
  };

  // Fetch non-critical data asynchronously
  const fetchNonEssentialData = async () => {
    try {
      const quizzesRes = await fetch('/api/quizzes', {
        headers: { 'Cache-Control': 'public, max-age=600' } // 10min cache
      });
      
      if (quizzesRes.ok) {
        const quizzesData = await quizzesRes.json();
        setAvailableQuizzes(quizzesData.data?.filter(q => q.canAttempt)?.slice(0, 3) || []);
      }
    } catch (error) {
      console.error('Error fetching non-essential data:', error);
    }
  };

  // Memoize complex calculations with enhanced design properties
  const memoizedStats = useMemo(() => {
    console.log('🔄 Memoizing stats with data:', stats);
    
    if (!stats) {
      console.log('❌ No stats data available');
      return null;
    }
    
    const completionRate = stats.enrolledCourses > 0 ? Math.round((stats.completedCourses / stats.enrolledCourses) * 100) : 0;
    const quizPerformance = stats.averageScore || 0;
    
    console.log('📈 Calculated values:', {
      enrolledCourses: stats.enrolledCourses,
      completedCourses: stats.completedCourses,
      completionRate,
      averageScore: stats.averageScore,
      quizPerformance,
      totalLearningHours: stats.totalLearningHours,
      quizzesTaken: stats.quizzesTaken
    });
    
    const processedStats = [
      {
        title: "Enrolled Courses",
        value: stats.enrolledCourses || 0,
        icon: BookOpen,
        description: "+2 from last month",
        color: "text-blue-600",
        iconBg: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50",
        gradientFrom: "rgba(59, 130, 246, 0.1)",
        gradientTo: "rgba(147, 197, 253, 0.05)",
        trend: true,
        trendColor: "text-green-500"
      },
      {
        title: "Completion Rate",
        value: `${completionRate}%`,
        icon: CheckCircle,
        description: `${stats.completedCourses || 0} of ${stats.enrolledCourses || 0} completed`,
        color: "text-green-600",
        iconBg: "from-green-500 to-emerald-600",
        bgColor: "bg-green-50",
        gradientFrom: "rgba(34, 197, 94, 0.1)",
        gradientTo: "rgba(110, 231, 183, 0.05)",
        progress: completionRate,
        progressGradient: "from-green-500 to-emerald-500",
        trend: completionRate > 50,
        trendColor: completionRate > 50 ? "text-green-500" : "text-gray-400"
      },
      {
        title: "Quiz Performance",
        value: `${Math.round(stats.averageScore || 0)}%`,
        icon: Trophy,
        description: `${stats.quizzesTaken || 0} quizzes completed`,
        color: "text-yellow-600",
        iconBg: "from-yellow-500 to-orange-500",
        bgColor: "bg-yellow-50",
        gradientFrom: "rgba(245, 158, 11, 0.1)",
        gradientTo: "rgba(251, 191, 36, 0.05)",
        progress: quizPerformance,
        progressGradient: "from-yellow-500 to-orange-500",
        trend: quizPerformance > 70,
        trendColor: quizPerformance > 70 ? "text-green-500" : quizPerformance > 50 ? "text-yellow-500" : "text-red-500"
      },
      {
        title: "Study Time",
        value: `${stats.totalLearningHours || 0}h`,
        icon: Clock,
        description: "This month",
        color: "text-purple-600",
        iconBg: "from-purple-500 to-indigo-600",
        bgColor: "bg-purple-50",
        gradientFrom: "rgba(147, 51, 234, 0.1)",
        gradientTo: "rgba(196, 181, 253, 0.05)",
        trend: (stats.totalLearningHours || 0) > 10,
        trendColor: "text-green-500"
      }
    ];
    
    console.log('✅ Processed stats for display:', processedStats);
    return processedStats;
  }, [stats]);

  // Show loading state only for initial load
  if (status === 'loading' || initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Student'}!
        </h2>
      </div>

      {/* Enhanced Stats Cards with Suspense */}
      <Suspense fallback={<StatsSkeleton />}>
        {memoizedStats ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {memoizedStats.map((stat, index) => (
              <Card 
                key={index} 
                className="relative overflow-hidden group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50"
              >
                {/* Background decoration */}
                <div className={`absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-300 ${stat.bgColor}`} 
                     style={{
                       background: `radial-gradient(circle, ${stat.gradientFrom} 0%, ${stat.gradientTo} 70%, transparent 100%)`
                     }} 
                />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.iconBg} shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <stat.icon className="h-5 w-5 text-white drop-shadow-sm" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    {stat.trend && (
                      <span className={`inline-flex items-center ${stat.trendColor}`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                      </span>
                    )}
                    {stat.description}
                  </p>
                  
                  {/* Progress bar for certain stats */}
                  {stat.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{stat.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className={`bg-gradient-to-r ${stat.progressGradient} h-1.5 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`}
                          style={{ width: `${stat.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <StatsSkeleton />
        )}
      </Suspense>

      {/* Main Dashboard Content */}
      <div className="space-y-6">
        {/* Continue Learning - Full Width Priority Section */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-primary to-blue-500 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                Continue Learning
              </div>
              <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/90">
                <Link href="/courses" className="flex items-center gap-1">
                  View All Courses <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Pick up where you left off and continue your learning journey
            </p>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<RecentCoursesSkeleton />}>
              <RecentCoursesSection 
                courses={recentCourses} 
                loading={dataLoading}
              />
            </Suspense>
          </CardContent>
        </Card>

        {/* Secondary Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded">
                  <Target className="h-4 w-4 text-white" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<QuickActionsSkeleton />}>
                <QuickActionsGrid />
              </Suspense>
            </CardContent>
          </Card>

          {/* Learning Progress Overview */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1 bg-gradient-to-r from-green-500 to-teal-500 rounded">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memoizedStats && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{memoizedStats[0].value}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Enrolled</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{memoizedStats[1].value}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{memoizedStats[2].value}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Avg Score</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{memoizedStats[3].value}h</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Learning</div>
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/profile/progress" className="flex items-center justify-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      View Detailed Progress
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Available Quizzes - Load Last */}
      {availableQuizzes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {availableQuizzes.map((quiz) => (
                <div key={quiz._id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{quiz.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {quiz.questionCount} questions • {quiz.timeLimit} minutes
                    </p>
                  </div>
                  <Button asChild className="h-8 px-3">
                    <Link href={`/quizzes/${quiz._id}`} className='flex items-center'>
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}