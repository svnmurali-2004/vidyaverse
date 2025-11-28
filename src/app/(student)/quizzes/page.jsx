'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import {
  Search,
  BookOpen,
  Target,
  TrendingUp,
  Award,
  Play,
  CheckCircle,
  AlertCircle,
  Sparkles,
  BrainCircuit,
  Timer,
  BarChart3
} from 'lucide-react';

export default function QuizzesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    if (session) {
      fetchQuizzes();
    }
  }, [session, status, router]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quizzes');
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score, passingScore) => {
    if (score >= passingScore) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= passingScore * 0.7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getAttemptStatus = (quiz) => {
    if (!quiz.lastAttempt) {
      return { text: 'Not attempted', color: 'text-slate-500', icon: AlertCircle };
    }

    const passed = quiz.lastAttempt.percentage >= quiz.passingScore;
    return {
      text: passed ? 'Passed' : 'Failed',
      color: passed ? 'text-green-600' : 'text-red-600',
      icon: passed ? CheckCircle : AlertCircle
    };
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                <BrainCircuit className="w-4 h-4" />
                <span>Knowledge Check</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                My Quizzes
              </h1>
              <p className="text-slate-600 max-w-xl text-lg">
                Test your understanding and track your progress across all your enrolled courses.
              </p>
            </div>

            {/* Search Box */}
            <div className="w-full md:w-auto min-w-[300px]">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg opacity-20 group-hover:opacity-40 transition duration-200 blur"></div>
                <div className="relative bg-white rounded-lg">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search quizzes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            {
              label: "Available Quizzes",
              value: quizzes.length,
              icon: BookOpen,
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-100"
            },
            {
              label: "Attempted",
              value: quizzes.filter(q => q.lastAttempt).length,
              icon: TrendingUp,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
              border: "border-indigo-100"
            },
            {
              label: "Passed",
              value: quizzes.filter(q => q.lastAttempt?.percentage >= q.passingScore).length,
              icon: Award,
              color: "text-green-600",
              bg: "bg-green-50",
              border: "border-green-100"
            },
            {
              label: "Avg. Score",
              value: `${quizzes.filter(q => q.lastAttempt).length > 0
                ? Math.round(quizzes.filter(q => q.lastAttempt).reduce((sum, q) => sum + q.lastAttempt.percentage, 0) / quizzes.filter(q => q.lastAttempt).length)
                : 0}%`,
              icon: BarChart3,
              color: "text-purple-600",
              bg: "bg-purple-50",
              border: "border-purple-100"
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

        {/* Quiz List */}
        <div className="space-y-4">
          {filteredQuizzes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchTerm ? 'No quizzes found' : 'No quizzes available'}
              </h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                {searchTerm
                  ? "We couldn't find any quizzes matching your search. Try different keywords."
                  : "Enroll in courses to unlock quizzes and test your knowledge."}
              </p>
              <Link href="/courses">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200/50">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredQuizzes.map((quiz) => {
                const status = getAttemptStatus(quiz);
                const StatusIcon = status.icon;

                return (
                  <Card key={quiz._id} className="group hover:shadow-lg hover:border-blue-200 transition-all duration-300 border-slate-200 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Left Status Strip */}
                        <div className={`w-full md:w-2 h-2 md:h-auto ${quiz.canAttempt ? 'bg-blue-500' : 'bg-slate-300'}`}></div>

                        <div className="flex-1 p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {quiz.title}
                              </h3>
                              <Badge variant={quiz.canAttempt ? "default" : "secondary"} className={quiz.canAttempt ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200" : ""}>
                                {quiz.canAttempt ? "Available" : "Completed"}
                              </Badge>
                              {quiz.isRequiredForCertificate && (
                                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                                  <Award className="w-3 h-3 mr-1" />
                                  Required
                                </Badge>
                              )}
                            </div>

                            <p className="text-slate-600 text-sm line-clamp-1">
                              {quiz.description || "Test your knowledge on this topic."}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <BookOpen className="h-4 w-4 text-slate-400" />
                                <span className="font-medium text-slate-700">{quiz.course?.title || 'Unknown Course'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Target className="h-4 w-4 text-slate-400" />
                                <span>{quiz.questions?.length || 0} Questions</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Timer className="h-4 w-4 text-slate-400" />
                                <span>{quiz.timeLimit} mins</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Side Actions */}
                          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 mt-2 md:mt-0">
                            {quiz.lastAttempt && (
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getScoreColor(quiz.lastAttempt.percentage, quiz.passingScore)}`}>
                                <div className="text-right">
                                  <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Score</div>
                                  <div className="font-bold text-lg leading-none">{Math.round(quiz.lastAttempt.percentage)}%</div>
                                </div>
                                <StatusIcon className="h-8 w-8 opacity-20" />
                              </div>
                            )}

                            <Link href={`/quizzes/${quiz._id}`} className="w-full sm:w-auto">
                              <Button
                                size="lg"
                                disabled={!quiz.canAttempt}
                                className={`w-full sm:w-auto min-w-[140px] font-semibold shadow-md ${!quiz.canAttempt
                                    ? 'bg-slate-100 text-slate-400'
                                    : 'bg-white text-blue-600 border-2 border-blue-100 hover:border-blue-600 hover:bg-blue-50'
                                  }`}
                              >
                                {quiz.lastAttempt ? (
                                  <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Retake Quiz
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4 mr-2 fill-current" />
                                    Start Quiz
                                  </>
                                )}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
