"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu, LayoutDashboard, Network } from "lucide-react";
import { toast } from "react-hot-toast";

// Import components
import CourseSidebar from "./components/CourseSidebar";
import LessonContent from "./components/LessonContent";
import LessonNavigation from "./components/LessonNavigation";
import CelebrationModal from "./components/CelebrationModal";
import CourseMindMap from "@/components/CourseMindMap";

export default function LearnPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const searchParams = useSearchParams();

  // State management
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
  const [certificateStatus, setCertificateStatus] = useState(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "mindmap"

  // Effects
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

  // API Functions
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
        setLessons(data.data || []);

        if (lessonId) {
          const targetLesson = data.data.find((l) => l._id === lessonId);
          if (targetLesson) {
            if (isPreviewMode && !targetLesson.isPreview) {
              toast.error("This lesson is not available for preview");
              router.push(`/courses/${courseId}`);
              return;
            }
            setCurrentLesson(targetLesson);
          }
        } else if (data.data.length > 0) {
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

  // Action Functions
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
          watchTime: 100,
        }),
      });

      if (response.ok) {
        setCompletedLessons((prev) => new Set(prev.add(lessonId)));
        toast.success("Lesson marked as complete!");

        const newCompletedLessons = new Set([...completedLessons, lessonId]);
        const completionPercentage = (newCompletedLessons.size / lessons.length) * 100;

        if (completionPercentage >= 80) {
          setTimeout(() => handleGenerateCertificate(false), 1000);
        }
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error);
    }
  };

  const handleGenerateCertificate = async (manual = false) => {
    if (isPreviewMode) return;

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
        setShowCelebration(true);
        setCertificateStatus({
          success: true,
          message: "🏆 Congratulations! Your certificate has been generated!",
          certificate: data.certificate
        });

        setTimeout(() => {
          setShowCertificateModal(true);
        }, 1000);

        setTimeout(() => {
          setShowCelebration(false);
        }, 6000);

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
            },
          }
        );
      } else if (data.requirements && !data.success) {
        const failedQuizzes = data.requirements.quizzes
          .filter(q => !q.passed)
          .map(q => ({ title: q.title }));

        if (failedQuizzes.length > 0) {
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

    router.push(
      `/courses/${courseId}/learn?lesson=${lesson._id}${isPreviewMode ? "&preview=true" : ""
      }`,
      { scroll: false }
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>

              <Link
                href={`/courses/${courseId}`}
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Course</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "list"
                  ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                List View
              </button>
              <button
                onClick={() => setViewMode("mindmap")}
                className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "mindmap"
                  ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
              >
                <Network className="w-4 h-4 mr-2" />
                Mind Map
              </button>
            </div>

            <div className="flex-1 text-center lg:hidden">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {course?.title}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <CourseSidebar
          course={course}
          lessons={lessons}
          quizzes={quizzes}
          currentLesson={currentLesson}
          completedLessons={completedLessons}
          enrollment={enrollment}
          isPreviewMode={isPreviewMode}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          selectLesson={selectLesson}
          certificateStatus={certificateStatus}
          isGeneratingCertificate={isGeneratingCertificate}
          handleGenerateCertificate={handleGenerateCertificate}
          showCertificateModal={showCertificateModal}
          setShowCertificateModal={setShowCertificateModal}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            {viewMode === "mindmap" ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Course Mind Map
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Visualize your learning path
                  </p>
                </div>
                <CourseMindMap
                  lessons={lessons}
                  currentLessonId={currentLesson?._id}
                  onLessonSelect={(lessonId) => {
                    const lesson = lessons.find((l) => l._id === lessonId);
                    if (lesson) {
                      selectLesson(lesson);
                      setViewMode("list");
                    }
                  }}
                />
              </div>
            ) : (
              <>
                <LessonContent
                  currentLesson={currentLesson}
                  isPreviewMode={isPreviewMode}
                  completedLessons={completedLessons}
                  markLessonComplete={markLessonComplete}
                />

                <LessonNavigation
                  lessons={lessons}
                  currentLesson={currentLesson}
                  selectLesson={selectLesson}
                  isPreviewMode={isPreviewMode}
                />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Celebration Modal */}
      <CelebrationModal
        showCelebration={showCelebration}
        showCertificateModal={showCertificateModal}
        setShowCertificateModal={setShowCertificateModal}
        certificateStatus={certificateStatus}
      />
    </div>
  );
}