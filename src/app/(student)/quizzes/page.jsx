'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import {
  Search,
  BookOpen,
  Clock,
  Target,
  Users,
  TrendingUp,
  Award,
  Play,
  CheckCircle,
  AlertCircle
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
    if (score >= passingScore) return 'text-green-600';
    if (score >= passingScore * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttemptStatus = (quiz) => {
    if (!quiz.lastAttempt) {
      return { text: 'Not attempted', color: 'text-gray-500', icon: AlertCircle };
    }
    
    const passed = quiz.lastAttempt.score >= quiz.passingScore;
    return {
      text: passed ? 'Passed' : 'Failed',
      color: passed ? 'text-green-600' : 'text-red-600',
      icon: passed ? CheckCircle : AlertCircle
    };
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Available Quizzes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test your knowledge with interactive quizzes from your enrolled courses
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Available Quizzes
                </p>
                <p className="text-2xl font-bold">{quizzes.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Attempted
                </p>
                <p className="text-2xl font-bold">
                  {quizzes.filter(q => q.lastAttempt).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Passed
                </p>
                <p className="text-2xl font-bold">
                  {quizzes.filter(q => q.lastAttempt?.score >= q.passingScore).length}
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Score
                </p>
                <p className="text-2xl font-bold">
                  {quizzes.filter(q => q.lastAttempt).length > 0
                    ? Math.round(
                        quizzes
                          .filter(q => q.lastAttempt)
                          .reduce((sum, q) => sum + q.lastAttempt.score, 0) /
                        quizzes.filter(q => q.lastAttempt).length
                      )
                    : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quiz List */}
      <div className="space-y-4">
        {filteredQuizzes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No quizzes found' : 'No quizzes available'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? "No quizzes match your search criteria" 
                  : "Enroll in courses to access their quizzes"}
              </p>
              <Link href="/courses">
                <Button>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredQuizzes.map((quiz) => {
            const status = getAttemptStatus(quiz);
            const StatusIcon = status.icon;
            
            return (
              <Card key={quiz._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {quiz.title}
                        </h3>
                        <Badge variant={quiz.canAttempt ? "default" : "secondary"}>
                          {quiz.canAttempt ? "Available" : "Completed"}
                        </Badge>
                        <div className={`flex items-center ${status.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">{status.text}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {quiz.description || "No description provided"}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {quiz.course?.title || 'No course'}
                        </span>
                        <span className="flex items-center">
                          <Target className="h-4 w-4 mr-1" />
                          {quiz.questions?.length || 0} questions
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {quiz.timeLimit} minutes
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {quiz.attemptCount || 0}/{quiz.attempts} attempts
                        </span>
                        {quiz.lastAttempt && (
                          <span className={`flex items-center font-medium ${getScoreColor(quiz.lastAttempt.score, quiz.passingScore)}`}>
                            <Award className="h-4 w-4 mr-1" />
                            Score: {quiz.lastAttempt.score}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-6">
                      <Link href={`/quizzes/${quiz._id}`}>
                        <Button 
                          size="lg"
                          disabled={!quiz.canAttempt}
                          className="min-w-[120px]"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {quiz.lastAttempt ? 'Retake' : 'Start Quiz'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
