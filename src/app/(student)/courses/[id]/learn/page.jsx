"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayer from "@/components/VideoPlayer";
import QuizTaker from "@/components/QuizTaker";
import DsaSheet from "@/components/DsaSheet";
import {
  Play,
  Clock,
  BookOpen,
  CheckCircle,
  Lock,
  ArrowLeft,
  Menu,
  X,
  FileText,
  MessageSquare,
  Download,
  SkipForward,
  SkipBack,
  Award,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { use } from "react";

export default function LearnPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const searchParams = useSearchParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [progress, setProgress] = useState({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [currentQuizAnswers, setCurrentQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [certificateStatus, setCertificateStatus] = useState(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const lessonId = searchParams.get("lesson");
    const preview = searchParams.get("preview") === "true";
    setIsPreviewMode(preview);

    if (courseId && (session || preview)) {
      fetchCourse();
      fetchLessons(lessonId);
      fetchQuizzes();
      if (!preview && session) {
        checkEnrollment();
        fetchProgress();
      }
    }
  }, [courseId, session, searchParams]);

  // Debug useEffect to track currentLesson changes
  useEffect(() => {
    console.log("🔄 Current lesson changed:", currentLesson);
    if (currentLesson) {
      console.log("📝 Lesson details:", {
        id: currentLesson._id,
        type: currentLesson.type,
        title: currentLesson.title,
        hasdsaSheet: !!currentLesson.dsaSheet
      });
    }
  }, [currentLesson]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data.data);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };

  const fetchLessons = async (lessonId) => {
    try {
      const response = await fetch(`/api/lessons?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched lessons:", data.data);
        setLessons(data.data || []);

        if (lessonId) {
          const targetLesson = data.data.find((l) => l._id === lessonId);
          if (targetLesson) {
            console.log("Target lesson:", targetLesson);
            if (isPreviewMode && !targetLesson.isPreview) {
              toast.error("This lesson is not available for preview");
              router.push(`/courses/${courseId}`);
              return;
            }
            setCurrentLesson(targetLesson);
          }
        } else if (data.data.length > 0) {
          console.log("Setting first lesson:", data.data[0]);
          setCurrentLesson(data.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`/api/quizzes?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched quizzes:", data.data);
        setQuizzes(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await fetch(`/api/enrollments?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setEnrollment(data.data[0]);
        } else if (!isPreviewMode) {
          toast.error("You are not enrolled in this course");
          router.push(`/courses/${courseId}`);
        }
      }
    } catch (error) {
      console.error("Error checking enrollment:", error);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/progress?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Progress API response:", data);
        const progressMap = {};
        const completed = new Set();

        data.data?.forEach((p) => {
          console.log("Processing progress item:", p);
          progressMap[p.lessonId._id || p.lessonId] = p;
          if (p.isCompleted) {
            completed.add(p.lessonId._id || p.lessonId);
            console.log("Added completed lesson:", p.lessonId._id || p.lessonId);
          }
        });

        console.log("Completed lessons set:", completed);
        console.log("Progress map:", progressMap);
        setProgress(progressMap);
        setCompletedLessons(completed);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const markLessonComplete = async (lessonId) => {
    if (isPreviewMode) return;

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          lessonId,
          completed: true,
          watchTime: 100, // Assume full watch time for completion
        }),
      });

      if (response.ok) {
        setCompletedLessons((prev) => new Set(prev.add(lessonId)));
        toast.success("Lesson marked as complete!");

        // Check if course is now complete and generate certificate if needed
        const newCompletedLessons = new Set([...completedLessons, lessonId]);
        const completionPercentage = (newCompletedLessons.size / lessons.length) * 100;
        
        if (completionPercentage >= 80) {
          await checkAndGenerateCertificate();
        }

        // Auto-advance to next lesson
        const currentIndex = lessons.findIndex((l) => l._id === lessonId);
        if (currentIndex < lessons.length - 1) {
          const nextLesson = lessons[currentIndex + 1];
          setTimeout(() => {
            selectLesson(nextLesson);
          }, 1500);
        } else if (completionPercentage >= 80) {
          // Course completed, show spectacular completion message
          setTimeout(() => {
            toast.success(
              "🎉 Fantastic! You've mastered this course! Ready for your certificate?",
              { 
                duration: 6000,
                style: {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: '2px solid #ffd700',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }
              }
            );
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error);
    }
  };

  const checkAndGenerateCertificate = async (manual = false) => {
    if (manual) {
      setIsGeneratingCertificate(true);
    }

    try {
      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Create spectacular success experience
        setShowCelebration(true);
        setCertificateStatus({ 
          success: true, 
          message: "🏆 Congratulations! Your certificate has been generated!",
          certificate: data.certificate 
        });
        
        // Show celebration modal after a brief delay
        setTimeout(() => {
          setShowCertificateModal(true);
        }, 1000);

        // Auto-hide celebration after 6 seconds
        setTimeout(() => {
          setShowCelebration(false);
        }, 6000);

        // Enhanced toast with celebration
        toast.success(
          "🎉 Achievement Unlocked! Your certificate is ready!",
          { 
            duration: 6000,
            style: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: '2px solid #ffd700',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }
          }
        );
      } else if (data.requirements) {
        // Show specific requirements not met
        const { lessons, quizzes } = data.requirements;
        
        if (!lessons.met) {
          const message = `Complete ${lessons.required}% of lessons to earn certificate (currently ${lessons.current.toFixed(1)}%)`;
          toast.error(message, { duration: 4000 });
          setCertificateStatus({ 
            success: false, 
            message, 
            requirements: data.requirements 
          });
        } else if (!quizzes.met) {
          const failedQuizzes = quizzes.details.filter(q => !q.passed);
          const message = `Pass all required quizzes to earn certificate. Outstanding: ${failedQuizzes.map(q => q.title).join(', ')}`;
          toast.error(message, { duration: 6000 });
          setCertificateStatus({ 
            success: false, 
            message, 
            requirements: data.requirements 
          });
        }
      } else {
        setCertificateStatus({ 
          success: false, 
          message: data.error || "Failed to generate certificate" 
        });
        if (manual) {
          toast.error(data.error || "Failed to generate certificate");
        }
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      setCertificateStatus({ 
        success: false, 
        message: "Error connecting to server" 
      });
      if (manual) {
        toast.error("Error generating certificate");
      }
    } finally {
      if (manual) {
        setIsGeneratingCertificate(false);
      }
    }
  };

  const selectLesson = (lesson) => {
    if (isPreviewMode && !lesson.isPreview) {
      toast.error(
        "This lesson requires enrollment. Please enroll to continue."
      );
      return;
    }

    setCurrentLesson(lesson);
    // Reset quiz state when switching lessons
    setCurrentQuizAnswers({});
    setQuizResults(null);
    setShowQuizResults(false);
    
    router.push(
      `/courses/${courseId}/learn?lesson=${lesson._id}${
        isPreviewMode ? "&preview=true" : ""
      }`,
      { scroll: false }
    );
  };

  const getNextLesson = () => {
    if (!currentLesson) return null;
    const currentIndex = lessons.findIndex((l) => l._id === currentLesson._id);
    return currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  };

  const getPreviousLesson = () => {
    if (!currentLesson) return null;
    const currentIndex = lessons.findIndex((l) => l._id === currentLesson._id);
    return currentIndex > 0 ? lessons[currentIndex - 1] : null;
  };

  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setCurrentQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const submitQuiz = () => {
    if (!currentLesson?.quiz?.questions) return;

    const questions = currentLesson.quiz.questions;
    let correctAnswers = 0;
    const totalQuestions = questions.length;

    // Calculate score
    questions.forEach((question, index) => {
      if (currentQuizAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = percentage >= (currentLesson.quiz.passingScore || 70);

    const results = {
      correctAnswers,
      totalQuestions,
      percentage,
      passed,
      answers: currentQuizAnswers
    };

    setQuizResults(results);
    setShowQuizResults(true);

    if (passed) {
      toast.success(`Great job! You scored ${percentage}%`);
      markLessonComplete(currentLesson._id);
    } else {
      toast.error(`You scored ${percentage}%. Try again to pass!`);
    }
  };

  const resetQuiz = () => {
    setCurrentQuizAnswers({});
    setQuizResults(null);
    setShowQuizResults(false);
  };

  const renderVideoPlayer = () => {
    if (
      !currentLesson ||
      currentLesson.type !== "video" ||
      !currentLesson.videoUrl
    ) {
      return (
        <VideoPlayer
          videoUrl={null}
          title="No video available"
          className="w-full aspect-video"
        />
      );
    }

    return (
      <VideoPlayer
        videoUrl={currentLesson.videoUrl}
        title={currentLesson.title}
        className="w-full aspect-video"
        onEnded={() => !isPreviewMode && markLessonComplete(currentLesson._id)}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated" && !isPreviewMode) {
    router.push("/signin");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Celebration Confetti Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
          {/* Confetti Animation */}
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][Math.floor(Math.random() * 6)],
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          {/* Central Achievement Banner */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="bg-white/95 dark:bg-gray-800/95 p-8 rounded-2xl shadow-2xl border-4 border-yellow-400 animate-bounce">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                CERTIFICATE EARNED!
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Outstanding Achievement!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Success Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-scale-in">
            <div className="relative p-8 text-center">
              {/* Close button */}
              <button
                onClick={() => setShowCertificateModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
              
              {/* Success Content */}
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Award className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    🎉 Congratulations!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You've successfully completed <span className="font-semibold text-blue-600">{course?.title}</span> and earned your certificate!
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full text-sm font-medium text-green-800 dark:text-green-400">
                    <Award className="h-4 w-4 mr-2" />
                    Certificate Ready for Download
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      router.push('/certificates');
                      setShowCertificateModal(false);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Award className="h-5 w-5 mr-2" />
                    View & Download Certificate
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowCertificateModal(false)}
                    className="w-full"
                  >
                    Continue Learning
                  </Button>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Share your achievement on social media! 🎓
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/courses/${courseId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Link>
          </Button>
          <div className="hidden md:block">
            <h1 className="font-semibold text-lg truncate max-w-md">
              {course?.title}
            </h1>
            {currentLesson && (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {currentLesson.title}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isPreviewMode && (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-600"
            >
              Preview Mode
            </Badge>
          )}

          {!isPreviewMode && enrollment && (
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <span>Progress:</span>
              <div className="w-24">
                <Progress
                  value={(completedLessons.size / lessons.length) * 100}
                  className="h-2"
                />
              </div>
              <span>
                {completedLessons.size}/{lessons.length}
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>

          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block"
          >
            {sidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`w-80 bg-white dark:bg-gray-800 border-r transition-all duration-200 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed left-0 top-0 h-full z-30 lg:relative lg:translate-x-0 lg:block lg:z-auto`}
        >
          <div className="p-4 border-b">
            <h3 className="font-semibold">Course Content</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {completedLessons.size}/{lessons.length} lessons • {quizzes.length} quizzes
            </p>
            {!isPreviewMode && (
              <Progress
                value={(completedLessons.size / lessons.length) * 100}
                className="mt-2 h-2"
              />
            )}
          </div>

          <div className="h-full overflow-y-auto pb-20">
            <div className="p-4 space-y-4">
              {/* Lessons Section */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide">Lessons</h4>
                {lessons.map((lesson, index) => {
                  const isCompleted = completedLessons.has(lesson._id);
                  const isCurrent = currentLesson?._id === lesson._id;
                  const isAccessible = !isPreviewMode || lesson.isPreview;

                  return (
                    <button
                      key={lesson._id}
                      onClick={() => isAccessible && selectLesson(lesson)}
                      disabled={!isAccessible}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        isCurrent
                          ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-500"
                          : isAccessible
                          ? "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent"
                          : "bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : !isAccessible ? (
                            <Lock className="h-5 w-5 text-gray-400" />
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center text-xs">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-medium text-sm truncate ${
                              isCurrent
                                ? "text-blue-900 dark:text-blue-100"
                                : "text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            {lesson.title}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {lesson.type}
                            </Badge>
                            {lesson.duration && (
                              <span className="text-xs text-gray-500">
                                {lesson.duration}m
                              </span>
                            )}
                            {lesson.isPreview && (
                              <Badge
                                variant="outline"
                                className="text-xs text-blue-600 border-blue-600"
                              >
                                Preview
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quizzes Section */}
              {quizzes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide">Quizzes</h4>
                  {quizzes.map((quiz, index) => {
                    const canAttempt = quiz.canAttempt && !isPreviewMode;
                    const hasAttempted = quiz.attemptCount > 0;
                    const lastScore = quiz.lastAttempt?.percentage || 0;
                    const passed = quiz.lastAttempt?.passed || false;

                    return (
                      <div
                        key={quiz._id}
                        className={`w-full p-3 rounded-lg border-2 ${
                          passed
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                            : hasAttempted
                            ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                            : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {quiz.title}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Quiz
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {quiz.questions?.length || 0} questions
                              </span>
                              {hasAttempted && (
                                <span className={`text-xs ${passed ? 'text-green-600' : 'text-yellow-600'}`}>
                                  {lastScore}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            {passed ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : isPreviewMode ? (
                              <Lock className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Button 
                                size="sm" 
                                variant={hasAttempted ? "outline" : "default"}
                                onClick={() => {
                                  // Navigate to quiz page or show quiz modal
                                  router.push(`/quizzes/${quiz._id}`);
                                }}
                                disabled={!canAttempt}
                              >
                                {hasAttempted ? 'Retake' : 'Start'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Certificate Section */}
              {!isPreviewMode && enrollment && completedLessons.size > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide">Certificate</h4>
                  <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    certificateStatus?.success 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700 shadow-lg'
                      : 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800'
                  }`}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded-lg ${
                          certificateStatus?.success 
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          <Award className={`h-4 w-4 ${
                            certificateStatus?.success ? 'text-green-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <span className="font-medium text-sm">Course Certificate</span>
                        {certificateStatus?.success && (
                          <div className="flex-1 flex justify-end">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Lesson Progress:</span>
                          <span className={`font-medium ${
                            (completedLessons.size / lessons.length) * 100 >= 80 
                              ? 'text-green-600' 
                              : 'text-orange-600'
                          }`}>
                            {Math.round((completedLessons.size / lessons.length) * 100)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {completedLessons.size} of {lessons.length} lessons completed
                        </div>
                        <div className="relative">
                          <Progress
                            value={(completedLessons.size / lessons.length) * 100}
                            className="h-2 bg-gray-200 dark:bg-gray-700"
                          />
                          {(completedLessons.size / lessons.length) * 100 >= 80 && (
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full h-2 animate-pulse opacity-75"></div>
                          )}
                        </div>
                      </div>

                      {certificateStatus && (
                        <div className={`p-3 rounded-lg text-xs transition-all duration-300 ${
                          certificateStatus.success 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400 border border-green-200 dark:border-green-700' 
                            : 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 dark:from-orange-900/30 dark:to-yellow-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-700'
                        }`}>
                          <div className="flex items-start space-x-2">
                            {certificateStatus.success ? (
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="h-4 w-4 flex-shrink-0 animate-bounce" />
                                <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
                              </div>
                            ) : (
                              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <span className="leading-tight font-medium">{certificateStatus.message}</span>
                              {certificateStatus.success && (
                                <div className="mt-1 text-xs opacity-75">
                                  Ready for download! 🎓
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {!certificateStatus.success && certificateStatus.requirements && (
                            <div className="mt-3 space-y-2">
                              {certificateStatus.requirements.quizzes && !certificateStatus.requirements.quizzes.met && (
                                <div className="text-xs bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                                  <span className="font-medium">Required Quizzes:</span>
                                  <div className="ml-2 space-y-1 mt-1">
                                    {certificateStatus.requirements.quizzes.details
                                      .filter(q => !q.passed)
                                      .map((quiz, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                          <span>• {quiz.title}</span>
                                          <span className="text-red-600 font-medium">Need {quiz.passingScore}%</span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <Button
                        size="sm"
                        onClick={() => {
                          if (certificateStatus?.success) {
                            router.push('/certificates');
                          } else {
                            checkAndGenerateCertificate(true);
                          }
                        }}
                        disabled={isGeneratingCertificate || (completedLessons.size / lessons.length) * 100 < 80}
                        className={`w-full transition-all duration-300 ${
                          certificateStatus?.success
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg transform hover:scale-105'
                            : isGeneratingCertificate 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105'
                        } font-medium rounded-lg shadow-md`}
                        variant={certificateStatus?.success ? "default" : "default"}
                      >
                        {isGeneratingCertificate ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                            <span className="animate-pulse">Generating Magic...</span>
                          </>
                        ) : certificateStatus?.success ? (
                          <>
                            <Award className="h-4 w-4 mr-2" />
                            <span className="flex items-center">
                              View Certificate
                              <div className="ml-2 w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            </span>
                          </>
                        ) : (
                          <>
                            <Award className="h-3 w-3 mr-2" />
                            Generate Certificate
                          </>
                        )}
                      </Button>

                      {(completedLessons.size / lessons.length) * 100 < 80 && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500">
                            Complete 80% of lessons to unlock certificate
                          </p>
                          <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                            {80 - Math.round((completedLessons.size / lessons.length) * 100)}% remaining
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Video Player - Only show for video lessons */}
          {currentLesson?.type === "video" && (
            <div className="bg-black flex-shrink-0">
              {renderVideoPlayer()}
            </div>
          )}

          {/* Lesson Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-6 max-w-4xl mx-auto">
              {currentLesson && (
                <div className="space-y-6">
                  {/* Lesson Header */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">
                        {currentLesson.title}
                      </h2>
                      {!isPreviewMode &&
                        !completedLessons.has(currentLesson._id) && (
                          <Button
                            onClick={() =>
                              markLessonComplete(currentLesson._id)
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                        )}
                      {completedLessons.has(currentLesson._id) && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <Badge variant="outline">{currentLesson.type}</Badge>
                      {currentLesson.duration && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {currentLesson.duration} min
                        </div>
                      )}
                      {currentLesson.isPreview && (
                        <Badge
                          variant="outline"
                          className="text-blue-600 border-blue-600"
                        >
                          Preview Available
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Lesson Description */}
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {currentLesson.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Lesson Content */}
                  <Tabs defaultValue="content" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="resources">Resources</TabsTrigger>
                      <TabsTrigger value="discussion">Discussion</TabsTrigger>
                    </TabsList>

                    <TabsContent value="content">
                      <Card>
                        <CardContent className="p-6">
                          {/* Debug Section */}
                          <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded">
                            <h3 className="font-bold text-purple-800 mb-2">🔍 Debug Information</h3>
                            <div className="text-sm space-y-1">
                              <p><strong>Current Lesson Exists:</strong> {currentLesson ? 'Yes' : 'No'}</p>
                              <p><strong>Lesson Type:</strong> {currentLesson?.type || 'undefined'}</p>
                              <p><strong>Lesson ID:</strong> {currentLesson?._id || 'undefined'}</p>
                              <p><strong>Is DSA Type:</strong> {currentLesson?.type === "dsa" ? 'Yes' : 'No'}</p>
                              <p><strong>Has dsaSheet:</strong> {currentLesson?.dsaSheet ? 'Yes' : 'No'}</p>
                              {currentLesson && (
                                <details className="mt-2">
                                  <summary className="cursor-pointer font-medium">Raw Lesson Data</summary>
                                  <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                                    {JSON.stringify(currentLesson, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>

                          {console.log("Current lesson:", currentLesson)}
                          {console.log("Lesson type:", currentLesson?.type)}
                          {console.log("Quiz data:", currentLesson?.quiz)}
                          {console.log("🚀 Learn page rendering...")}
                          {currentLesson.type === "quiz" && currentLesson.quiz?.questions?.length > 0 ? (
                            <div className="space-y-6">
                              <div className="text-center">
                                <h3 className="text-lg font-semibold mb-2">Quiz: {currentLesson.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                  Test your knowledge with this interactive quiz
                                </p>
                              </div>
                              
                              {currentLesson.quiz && currentLesson.quiz.questions?.length > 0 ? (
                                <div className="space-y-6">
                                  {!showQuizResults ? (
                                    <>
                                      {currentLesson.quiz.questions.map((question, questionIndex) => (
                                        <Card key={questionIndex} className="p-4">
                                          <div className="space-y-4">
                                            <div className="flex items-start space-x-3">
                                              <Badge variant="outline" className="mt-1">
                                                {questionIndex + 1}
                                              </Badge>
                                              <h4 className="font-medium text-lg flex-1">
                                                {question.question}
                                              </h4>
                                            </div>
                                            
                                            <div className="space-y-2 ml-8">
                                              {question.options?.map((option, optionIndex) => (
                                                <label 
                                                  key={optionIndex}
                                                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                                >
                                                  <input
                                                    type="radio"
                                                    name={`question-${questionIndex}`}
                                                    value={optionIndex}
                                                    checked={currentQuizAnswers[questionIndex] === optionIndex}
                                                    onChange={() => handleQuizAnswer(questionIndex, optionIndex)}
                                                    className="text-blue-600"
                                                  />
                                                  <span className="flex-1">{option}</span>
                                                </label>
                                              ))}
                                            </div>
                                          </div>
                                        </Card>
                                      ))}
                                      
                                      <div className="flex justify-center space-x-4 pt-4">
                                        <Button 
                                          onClick={submitQuiz}
                                          disabled={Object.keys(currentQuizAnswers).length !== currentLesson.quiz.questions.length}
                                          className="px-8"
                                        >
                                          Submit Quiz
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <Card className="p-6">
                                      <div className="text-center space-y-4">
                                        <div className={`text-6xl ${quizResults.passed ? 'text-green-500' : 'text-red-500'}`}>
                                          {quizResults.passed ? '🎉' : '📚'}
                                        </div>
                                        <h3 className="text-2xl font-bold">
                                          {quizResults.passed ? 'Congratulations!' : 'Keep Learning!'}
                                        </h3>
                                        <div className="text-lg">
                                          <span className="font-semibold">Score: {quizResults.percentage}%</span>
                                          <br />
                                          <span className="text-gray-600">
                                            {quizResults.correctAnswers} out of {quizResults.totalQuestions} correct
                                          </span>
                                        </div>
                                        {quizResults.passed ? (
                                          <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                                            Quiz Passed!
                                          </Badge>
                                        ) : (
                                          <Badge variant="destructive" className="text-lg px-4 py-2">
                                            Need {currentLesson.quiz.passingScore || 70}% to pass
                                          </Badge>
                                        )}
                                        <div className="flex justify-center space-x-4 pt-4">
                                          <Button onClick={resetQuiz} variant="outline">
                                            Try Again
                                          </Button>
                                          {quizResults.passed && (
                                            <Button onClick={() => {
                                              const nextLesson = getNextLesson();
                                              if (nextLesson) selectLesson(nextLesson);
                                            }}>
                                              Next Lesson
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </Card>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <div className="text-gray-500">Quiz content is not available yet.</div>
                                  <p className="text-sm text-gray-400 mt-2">
                                    Please contact your instructor if this is unexpected.
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Enhanced content display */}
                              {currentLesson.content ? (
                                <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20">
                                  <div 
                                    className="formatted-content"
                                    dangerouslySetInnerHTML={{
                                      __html: currentLesson.content
                                    }}
                                  />
                                </div>
                              ) : (
                                // Fallback for plain text or no content
                                <div className="space-y-6">
                                  {currentLesson.description && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                        About This Lesson
                                      </h3>
                                      <p className="text-blue-800 dark:text-blue-200 leading-relaxed whitespace-pre-wrap">
                                        {currentLesson.description}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Video lesson content */}
                                  {currentLesson.type === "video" && (
                                    <div className="space-y-4">
                                      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                                        <div className="flex items-center space-x-3 mb-4">
                                          <Play className="h-6 w-6 text-blue-600" />
                                          <h3 className="text-xl font-semibold">Video Lesson</h3>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                          Watch the video above to learn about {currentLesson.title.toLowerCase()}. 
                                          Take notes as you follow along, and don't forget to mark the lesson as complete when you're done!
                                        </p>
                                        {currentLesson.duration && (
                                          <div className="mt-4 inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                                            <Clock className="h-4 w-4 mr-1" />
                                            Duration: {currentLesson.duration} minutes
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* DSA Sheet lesson content */}
                                  {currentLesson.type === "dsa" && (
                                    <div className="space-y-4">
                                      <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-green-800 mb-2">🚀 DSA Sheet Component Loading...</h3>
                                        <p className="text-green-700">Lesson type: {currentLesson.type}</p>
                                        <p className="text-green-700">DSA Sheet exists: {currentLesson.dsaSheet ? 'Yes' : 'No'}</p>
                                        <p className="text-green-700">About to render DsaSheet component...</p>
                                      </div>
                                      {console.log("🔥 About to render DsaSheet with lesson:", currentLesson)}
                                      <DsaSheet 
                                        lesson={currentLesson}
                                        onProgressUpdate={(completed, total) => {
                                          console.log(`DSA Progress: ${completed}/${total}`);
                                        }}
                                      />
                                      <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-2">✅ DSA Sheet Component Rendered</h3>
                                        <p className="text-blue-700">If you can see this, the DsaSheet component was called successfully.</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Text lesson content */}
                                  {currentLesson.type === "text" && (
                                    <div className="space-y-4">
                                      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                                        <div className="flex items-center space-x-3 mb-4">
                                          <BookOpen className="h-6 w-6 text-green-600" />
                                          <h3 className="text-xl font-semibold">Reading Material</h3>
                                        </div>
                                        <div className="prose prose-lg max-w-none dark:prose-invert">
                                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                            {currentLesson.description || "This is a text-based lesson. Please read through the material carefully and take notes as needed."}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Default fallback */}
                                  {!currentLesson.content && !currentLesson.description && (
                                    <div className="text-center py-12">
                                      <BookOpen className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        Content Coming Soon
                                      </h3>
                                      <p className="text-gray-600 dark:text-gray-400">
                                        Additional lesson content will be available here soon.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="resources">
                      <Card>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                  <div className="font-medium">
                                    Lesson Notes
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Download lesson summary and key points
                                  </div>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-green-600" />
                                <div>
                                  <div className="font-medium">
                                    Exercise Files
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Practice files for this lesson
                                  </div>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="discussion">
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center text-gray-600 dark:text-gray-400">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Discussion feature coming soon!</p>
                            <p className="text-sm">
                              Connect with other students and share your
                              thoughts.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-6">
                    <div>
                      {getPreviousLesson() && (
                        <Button
                          variant="outline"
                          onClick={() => selectLesson(getPreviousLesson())}
                        >
                          <SkipBack className="h-4 w-4 mr-2" />
                          Previous Lesson
                        </Button>
                      )}
                    </div>
                    <div>
                      {getNextLesson() && (
                        <Button
                          onClick={() => selectLesson(getNextLesson())}
                          disabled={
                            isPreviewMode && !getNextLesson()?.isPreview
                          }
                        >
                          Next Lesson
                          <SkipForward className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
