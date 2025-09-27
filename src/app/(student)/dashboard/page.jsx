'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    quizzesTaken: 0,
    averageScore: 0,
    totalLearningHours: 0,
    certificates: 0
  });
  
  const [recentCourses, setRecentCourses] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    if (status === 'authenticated') {
      // Redirect admin users to admin dashboard
      if (session?.user?.role === 'admin') {
        router.push('/admin');
        return;
      }
      
      fetchDashboardData();
    }
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user enrollments, quizzes, and certificates
      const [enrollmentsRes, quizzesRes, certificatesRes] = await Promise.all([
        fetch('/api/enrollments'),
        fetch('/api/quizzes'),
        fetch('/api/certificates')
      ]);

      let enrollments = [];
      let quizzes = [];
      let certificates = [];

      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json();
        enrollments = enrollmentsData.data || [];
        setRecentCourses(enrollments.slice(0, 4));
      }

      if (quizzesRes.ok) {
        const quizzesData = await quizzesRes.json();
        quizzes = quizzesData.data || [];
        setAvailableQuizzes(quizzes.filter(q => q.canAttempt).slice(0, 3));
      }

      if (certificatesRes.ok) {
        const certificatesData = await certificatesRes.json();
        certificates = certificatesData.data || [];
      }

      // Calculate user statistics
      const completedCourses = enrollments.filter(e => e.progressPercentage >= 100).length;
      const quizzesTaken = quizzes.filter(q => q.lastAttempt).length;
      const averageScore = quizzesTaken > 0 
        ? Math.round(quizzes
            .filter(q => q.lastAttempt)
            .reduce((sum, q) => sum + q.lastAttempt.percentage, 0) / quizzesTaken)
        : 0;

      setStats({
        enrolledCourses: enrollments.length,
        completedCourses,
        quizzesTaken,
        averageScore,
        totalLearningHours: Math.round(enrollments.reduce((sum, e) => sum + (e.course?.duration || 0), 0)),
        certificates: certificates.length
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Browse Courses',
      description: 'Discover new courses to enhance your skills',
      icon: BookOpen,
      href: '/courses',
      color: 'bg-blue-500'
    },
    {
      title: 'My Certificates',
      description: 'View and download your course certificates',
      icon: Award,
      href: '/certificates',
      color: 'bg-yellow-500'
    },
    {
      title: 'Take Quizzes',
      description: 'Test your knowledge with interactive quizzes',
      icon: HelpCircle,
      href: '/quizzes',
      color: 'bg-green-500'
    },
    {
      title: 'View Profile',
      description: 'Manage your account and preferences',
      icon: User,
      href: '/profile',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                Welcome back, {session?.user?.name || 'Student'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                Continue your learning journey and track your progress
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Bell className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">Notifications</span>
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Search className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">Search</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.enrolledCourses}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enrolled Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                  <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.completedCourses}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.averageScore}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Quiz Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalLearningHours}h
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Learning Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8 min-w-0">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <Link key={index} href={action.href}>
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer min-w-0">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-lg ${action.color} text-white flex-shrink-0`}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {action.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Courses */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Continue Learning</CardTitle>
                  <Link href="/courses">
                    <Button variant="ghost" size="sm">
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No courses enrolled
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Start your learning journey by enrolling in a course
                    </p>
                    <Link href="/courses">
                      <Button>Browse Courses</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCourses.map((enrollment) => (
                      <div
                        key={enrollment._id}
                        className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {enrollment.course?.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                            {enrollment.course?.instructor?.name}
                          </p>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{enrollment.progressPercentage || 0}%</span>
                            </div>
                            <Progress value={enrollment.progressPercentage || 0} />
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Link href={`/courses/${enrollment.course?._id}/learn`}>
                            <Button size="sm" className="w-full sm:w-auto">
                              <Play className="h-4 w-4 mr-2" />
                              Continue
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Available Quizzes */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Available Quizzes</CardTitle>
                  <Link href="/quizzes">
                    <Button variant="ghost" size="sm">
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {availableQuizzes.length === 0 ? (
                  <div className="text-center py-4">
                    <HelpCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No quizzes available
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableQuizzes.map((quiz) => (
                      <div key={quiz._id} className="p-3 rounded border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                          {quiz.title}
                        </h4>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <Target className="h-3 w-3 mr-1" />
                            {quiz.questions?.length || 0} questions
                          </div>
                          <Link href={`/quizzes/${quiz._id}`}>
                            <Button size="xs">Start</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm">Certificates</span>
                    </div>
                    <span className="font-semibold">{stats.certificates}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm">Quizzes Taken</span>
                    </div>
                    <span className="font-semibold">{stats.quizzesTaken}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Avg Score</span>
                    </div>
                    <span className="font-semibold">{stats.averageScore}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/profile" className="block text-sm text-blue-600 hover:text-blue-800">
                    • View Profile
                  </Link>
                  <Link href="/settings" className="block text-sm text-blue-600 hover:text-blue-800">
                    • Account Settings
                  </Link>
                  <Link href="/courses" className="block text-sm text-blue-600 hover:text-blue-800">
                    • Browse All Courses
                  </Link>
                  <Link href="/quizzes" className="block text-sm text-blue-600 hover:text-blue-800">
                    • Take Quizzes
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
