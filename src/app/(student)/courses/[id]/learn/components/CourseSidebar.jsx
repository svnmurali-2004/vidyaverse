"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Clock,
  BookOpen,
  CheckCircle,
  Lock,
  Menu,
  X,
  Award,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import CertificateSection from "./CertificateSection";

const CourseSidebar = ({
  course,
  lessons,
  quizzes,
  currentLesson,
  completedLessons,
  enrollment,
  isPreviewMode,
  sidebarOpen,
  setSidebarOpen,
  selectLesson,
  certificateStatus,
  isGeneratingCertificate,
  handleGenerateCertificate,
  showCertificateModal,
  setShowCertificateModal,
}) => {
  const router = useRouter();

  const completionPercentage = lessons.length > 0
    ? Math.round((completedLessons.size / lessons.length) * 100)
    : 0;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-96 bg-white dark:bg-gray-900 border-r 
        border-gray-200 dark:border-gray-800 transform transition-transform 
        duration-300 ease-in-out z-30 lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                {course?.title || "Loading..."}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress */}
            {!isPreviewMode && lessons.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{completedLessons.size}/{lessons.length} lessons</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">
                  {completionPercentage}% complete
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Lessons */}
            <div className="space-y-2 mb-6">
              <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide">
                Lessons
              </h4>
              {lessons.map((lesson, index) => {
                const isCompleted = completedLessons.has(lesson._id);
                const isCurrent = currentLesson?._id === lesson._id;

                // Locking logic
                let isLocked = isPreviewMode && !lesson.isPreview;

                if (!isPreviewMode) {
                  const previousLesson = index > 0 ? lessons[index - 1] : null;
                  const previousCompleted = previousLesson ? completedLessons.has(previousLesson._id) : true;

                  // Lock if neither this lesson nor the previous one is completed
                  // Exception: First lesson is always unlocked (previousCompleted is true)
                  if (!isCompleted && !previousCompleted) {
                    isLocked = true;
                  }
                }

                return (
                  <button
                    key={lesson._id}
                    onClick={() => selectLesson(lesson)}
                    disabled={isLocked}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${isCurrent
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      : isCompleted
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : isLocked
                          ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed"
                          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : isLocked ? (
                          <Lock className="h-5 w-5 text-gray-400" />
                        ) : lesson.type === "video" ? (
                          <Play className="h-5 w-5 text-blue-600" />
                        ) : (
                          <BookOpen className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {index + 1}.
                          </span>
                        </div>
                        <h4 className={`font-medium text-sm truncate ${isCurrent
                          ? "text-blue-900 dark:text-blue-100"
                          : isCompleted
                            ? "text-green-900 dark:text-green-100"
                            : isLocked
                              ? "text-gray-400"
                              : "text-gray-900 dark:text-gray-100"
                          }`}>
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
            <div className="space-y-2 mb-6">
              <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide">
                Quizzes
              </h4>
              {quizzes.length > 0 ? (
                quizzes.map((quiz, index) => {
                  const canAttempt = quiz.canAttempt && !isPreviewMode;
                  const hasAttempted = quiz.attemptCount > 0;
                  const lastScore = quiz.lastAttempt?.percentage || 0;
                  const passed = quiz.lastAttempt?.passed || false;

                  return (
                    <div
                      key={quiz._id}
                      className={`w-full p-3 rounded-lg border-2 ${passed
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
                })
              ) : (
                <div className="text-sm text-gray-500 italic p-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
                  No quizzes found
                </div>
              )}
            </div>

            {/* Certificate Section */}
            <CertificateSection
              isPreviewMode={isPreviewMode}
              enrollment={enrollment}
              completedLessons={completedLessons}
              lessons={lessons}
              certificateStatus={certificateStatus}
              isGeneratingCertificate={isGeneratingCertificate}
              handleGenerateCertificate={handleGenerateCertificate}
              showCertificateModal={showCertificateModal}
              setShowCertificateModal={setShowCertificateModal}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseSidebar;