'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import QuizTaker from '@/components/QuizTaker';
import toast from 'react-hot-toast';
import {
  Clock,
  Users,
  Target,
  AlertTriangle,
  BookOpen,
  Trophy,
  RotateCcw,
  CheckCircle
} from 'lucide-react';

export default function QuizPage() {
  const params = useParams();
  const quizId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [canAttempt, setCanAttempt] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`);
      if (response.ok) {
        const data = await response.json();
        setQuiz(data.quiz);
        setAttempts(data.attempts || []);
        setCanAttempt(data.canAttempt);
        setLastAttempt(data.lastAttempt);
      } else {
        toast.error('Failed to load quiz');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = (results) => {
    setShowQuiz(false);
    fetchQuiz(); // Refresh quiz data
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Quiz not found</h1>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  if (showQuiz) {
    return (
      <div className="container mx-auto px-6 py-8">
        <QuizTaker quiz={quiz} onComplete={handleQuizComplete} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Quiz Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <BookOpen className="h-6 w-6 mr-2" />
                {quiz.title}
              </CardTitle>
              {quiz.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {quiz.description}
                </p>
              )}
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <Badge variant={quiz.isActive ? 'default' : 'secondary'}>
                {quiz.isActive ? 'Active' : 'Inactive'}
              </Badge>
              
              {lastAttempt && (
                <Badge variant={lastAttempt.passed ? 'default' : 'destructive'}>
                  Last: {lastAttempt.percentage}%
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-2xl font-bold">{quiz.questions?.length || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-2xl font-bold">{quiz.timeLimit}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Minutes</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-2xl font-bold">{quiz.passingScore}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">To Pass</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <RotateCcw className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-2xl font-bold">{attempts.length}/{quiz.attempts}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Attempts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {canAttempt ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Ready to start?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You have {quiz.attempts - attempts.length} attempt{quiz.attempts - attempts.length !== 1 ? 's' : ''} remaining.
              </p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Before you start:</h4>
                  <ul className="text-sm text-left space-y-1">
                    <li>• Make sure you have a stable internet connection</li>
                    <li>• You have {quiz.timeLimit} minutes to complete the quiz</li>
                    <li>• You cannot pause or restart once you begin</li>
                    <li>• Answer all questions before time runs out</li>
                  </ul>
                </div>
                
                <Button
                  size="lg"
                  onClick={handleStartQuiz}
                  className="min-w-[200px]"
                >
                  Start Quiz
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No more attempts</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You have used all {quiz.attempts} attempts for this quiz.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Previous Attempts */}
      {attempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Your Attempts
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {attempts.map((attempt, index) => (
                <div key={attempt._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">
                        Attempt {attempt.attemptNumber}
                      </Badge>
                      
                      <Badge variant={attempt.passed ? 'default' : 'destructive'}>
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </Badge>
                      
                      {attempt.passed && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">{attempt.percentage}%</p>
                      <p className="text-sm text-gray-500">
                        {new Date(attempt.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Score:</span> {attempt.score}/{quiz.totalPoints || quiz.questions?.length || 0}
                    </div>
                    <div>
                      <span className="text-gray-500">Time:</span> {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span> 
                      <span className={attempt.passed ? 'text-green-600' : 'text-red-600'}>
                        {attempt.passed ? ' Passed' : ' Failed'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
