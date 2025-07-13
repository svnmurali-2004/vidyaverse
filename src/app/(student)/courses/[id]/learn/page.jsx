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
        const progressMap = {};
        const completed = new Set();

        data.data?.forEach((p) => {
          progressMap[p.lessonId._id || p.lessonId] = p;
          if (p.isCompleted) {
            completed.add(p.lessonId._id || p.lessonId);
          }
        });

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
          // Course completed, show completion message
          setTimeout(() => {
            toast.success("🎉 Congratulations! You've completed the course!");
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error);
    }
  };

  const checkAndGenerateCertificate = async () => {
    try {
      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(
            "🏆 Certificate generated! Check your certificates page to download it.",
            { duration: 5000 }
          );
        }
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      // Don't show error toast as certificate generation is optional
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
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Video Player */}
          <div
            className={`bg-black ${
              sidebarOpen ? "lg:ml-80" : ""
            } transition-all duration-200`}
          >
            {renderVideoPlayer()}
          </div>

          {/* Lesson Content */}
          <div
            className={`flex-1 ${
              sidebarOpen ? "lg:ml-80" : ""
            } transition-all duration-200`}
          >
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
                          {console.log("Current lesson:", currentLesson)}
                          {console.log("Lesson type:", currentLesson?.type)}
                          {console.log("Quiz data:", currentLesson?.quiz)}
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
                            <div
                              className="prose max-w-none dark:prose-invert"
                              dangerouslySetInnerHTML={{
                                __html:
                                  currentLesson.content ||
                                  "No additional content available for this lesson.",
                              }}
                            />
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
