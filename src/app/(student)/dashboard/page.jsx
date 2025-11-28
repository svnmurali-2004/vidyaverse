'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from 'react-hot-toast';
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Award,
  Play,
  Settings,
  Calendar,
  BarChart3,
  Bell,
  Search,
  ChevronRight,
  Star,
  CheckCircle,
  Sparkles,
  Zap,
  GraduationCap
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    if (status === 'authenticated') {
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Browse Courses',
      description: 'Find your next skill',
      icon: BookOpen,
      href: '/courses',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100'
    },
    {
      title: 'My Certificates',
      description: 'View achievements',
      icon: Award,
      href: '/certificates',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-100'
    },
    {
      title: 'Take a Quiz',
      description: 'Test your knowledge',
      icon: Trophy,
      href: '/quizzes',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100'
    },
    {
      title: 'Profile Settings',
      description: 'Update account',
      icon: Settings,
      href: '/settings',
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-100'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-20">
      {/* Hero Section */}
      <div className="relative bg-white border-b border-slate-100 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 transform opacity-30">
          <div className="h-64 w-64 rounded-full bg-blue-400 blur-3xl filter"></div>
        </div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 transform opacity-30">
          <div className="h-64 w-64 rounded-full bg-indigo-400 blur-3xl filter"></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Welcome back, {session?.user?.name?.split(' ')[0]}!</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Student Dashboard
              </h1>
              <p className="text-slate-600 max-w-xl text-lg">
                Track your progress, manage your courses, and achieve your learning goals.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/courses">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200/50">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            {
              label: "Enrolled Courses",
              value: stats.enrolledCourses,
              icon: BookOpen,
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-100"
            },
            {
              label: "Completed",
              value: stats.completedCourses,
              icon: CheckCircle,
              color: "text-green-600",
              bg: "bg-green-50",
              border: "border-green-100"
            },
            {
              label: "Avg. Quiz Score",
              value: `${stats.averageScore}%`,
              icon: BarChart3,
              color: "text-purple-600",
              bg: "bg-purple-50",
              border: "border-purple-100"
            },
            {
              label: "Certificates",
              value: stats.certificates,
              icon: Award,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
              border: "border-yellow-100"
            }
          ].map((stat, index) => (
            <Card key={index} className={`border ${stat.border} shadow-sm hover:shadow-md transition-all duration-200`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Courses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Recent Courses
                </h2>
                <Link href="/courses" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {recentCourses.length === 0 ? (
                <Card className="border-dashed border-slate-200 bg-slate-50/50">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <BookOpen className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">No courses yet</h3>
                    <p className="text-slate-500 mb-4 max-w-xs">Start your learning journey by enrolling in your first course.</p>
                    <Link href="/courses">
                      <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                        Explore Courses
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {recentCourses.map((enrollment) => (
                    <Card key={enrollment._id} className="group hover:shadow-md transition-all duration-200 border-slate-200">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row gap-5">
                          {/* Course Image Placeholder */}
                          <div className="w-full sm:w-32 h-20 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                            <BookOpen className="h-8 w-8 text-slate-400 group-hover:text-blue-400 transition-colors" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                {enrollment.course?.title}
                              </h3>
                              {enrollment.progressPercentage >= 100 && (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shrink-0">
                                  Completed
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 font-medium">{Math.round(enrollment.progressPercentage)}% Complete</span>
                                <span className="text-slate-400 text-xs">Last accessed recently</span>
                              </div>
                              <Progress value={enrollment.progressPercentage} className="h-2 bg-slate-100" />
                            </div>
                          </div>

                          <div className="flex items-center sm:self-center pt-2 sm:pt-0">
                            <Link href={`/courses/${enrollment.course?._id}/learn`} className="w-full sm:w-auto">
                              <Button size="sm" className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-100">
                                <Play className="h-3 w-3 mr-2 fill-current" />
                                {enrollment.progressPercentage > 0 ? 'Continue' : 'Start'}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions - Compact */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Quick Actions
              </h2>
              <div className="flex items-center gap-3">
                <TooltipProvider>
                  {quickActions.map((action, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Link href={action.href}>
                          <Button
                            variant="outline"
                            size="icon"
                            className={`h-12 w-12 rounded-full border-2 ${action.border} ${action.bg} hover:scale-110 transition-transform duration-200`}
                          >
                            <action.icon className={`h-5 w-5 ${action.color}`} />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{action.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>

            {/* Available Quizzes Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple-500" />
                  Quizzes
                </h2>
              </div>

              {availableQuizzes.length > 0 ? (
                <div className="space-y-3">
                  {availableQuizzes.map((quiz) => (
                    <Card key={quiz._id} className="border-slate-200 hover:border-purple-200 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">
                            {quiz.title}
                          </h4>
                          <Badge variant="secondary" className="text-[10px] h-5">
                            {quiz.questions?.length || 0} Qs
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 line-clamp-1">
                          {quiz.course?.title}
                        </p>
                        <Link href={`/quizzes/${quiz._id}`}>
                          <Button variant="ghost" size="sm" className="w-full justify-between text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-8 text-xs">
                            Take Quiz <ChevronRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-slate-50 border-dashed border-slate-200">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-slate-500">No quizzes available yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
