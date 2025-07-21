// components/DsaSheet.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Target,
  Trophy,
  Clock,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function DsaSheet({ lesson, onProgressUpdate }) {
  console.log("🔥 DsaSheet component called with lesson:", lesson);
  console.log("🔥 DsaSheet props:", { lesson, onProgressUpdate });
  console.log("🔥 Component mounting at:", new Date().toISOString());

  // Early return test
  if (!lesson) {
    console.log("❌ No lesson provided to DsaSheet component");
    return (
      <div className="p-4 bg-red-100 border border-red-400 rounded">
        No lesson provided to DsaSheet component
      </div>
    );
  }

  console.log("✅ Lesson exists, checking dsaSheet property...");
  console.log("📊 lesson.dsaSheet:", lesson.dsaSheet);
  console.log("📊 lesson.type:", lesson.type);

  const { data: session } = useSession();
  const [expandedCategories, setExpandedCategories] = useState(
    new Set([0, 1, 2, 3, 4])
  ); // Expand first 5 categories by default
  const [completedProblems, setCompletedProblems] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session && lesson._id) {
      fetchProgress();
    }
  }, [session, lesson._id]);

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/dsa-progress?lessonId=${lesson._id}`);
      if (response.ok) {
        const data = await response.json();
        setCompletedProblems(new Set(data.completedProblems || []));
      } else if (response.status !== 404) {
        // Only log errors that aren't "not found" - 404 is expected for new lessons
        console.error("Error fetching DSA progress:", response.status);
      }
    } catch (error) {
      console.error("Error fetching DSA progress:", error);
    }
  };

  const toggleProblemCompletion = async (
    problemId,
    categoryIndex,
    problemIndex
  ) => {
    if (!session) {
      toast.error("Please log in to track progress");
      return;
    }

    // For test cases or lessons that don't exist in DB, just update local state
    const isCompleted = completedProblems.has(problemId);
    const newCompleted = new Set(completedProblems);

    if (isCompleted) {
      newCompleted.delete(problemId);
    } else {
      newCompleted.add(problemId);
    }

    // Update local state immediately for better UX
    setCompletedProblems(newCompleted);
    toast.success(isCompleted ? "Problem unmarked!" : "Problem completed! 🎉");

    if (onProgressUpdate) {
      onProgressUpdate(newCompleted.size, getTotalProblems());
    }

    // Try to save to backend (will fail gracefully for test cases)
    setLoading(true);
    try {
      const response = await fetch("/api/dsa-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson._id,
          problemId,
          completed: !isCompleted,
          categoryIndex,
          problemIndex,
        }),
      });

      if (!response.ok && response.status !== 404) {
        // If it fails for reasons other than lesson not found, revert the change
        setCompletedProblems(completedProblems);
        toast.error("Failed to save progress to server");
      }
    } catch (error) {
      console.error("Error saving progress:", error);
      // Don't revert for network errors in case user is offline
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryIndex) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryIndex)) {
      newExpanded.delete(categoryIndex);
    } else {
      newExpanded.add(categoryIndex);
    }
    setExpandedCategories(newExpanded);
  };

  const getTotalProblems = () => {
    return (
      lesson.dsaSheet?.categories?.reduce(
        (total, category) => total + (category.problems?.length || 0),
        0
      ) || 0
    );
  };

  const getCategoryProgress = (category) => {
    const completed =
      category.problems?.filter((problem) =>
        completedProblems.has(problem._id || problem.id)
      ).length || 0;
    const total = category.problems?.length || 0;
    return {
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "hard":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const overallProgress = {
    completed: completedProblems.size,
    total: getTotalProblems(),
    percentage:
      getTotalProblems() > 0
        ? (completedProblems.size / getTotalProblems()) * 100
        : 0,
  };

  return (
    <div className="space-y-6">
      {/* Component Execution Confirmation */}
      <div className="p-4 bg-blue-100 border-2 border-blue-500 rounded-lg">
        <h2 className="text-xl font-bold text-blue-800">
          ✅ DSA Sheet Component is Working!
        </h2>
        <p className="text-blue-700">
          Timestamp: {new Date().toLocaleString()}
        </p>
        <p className="text-blue-700">Lesson ID: {lesson?._id}</p>
        <p className="text-blue-700">Lesson Type: {lesson?.type}</p>
        <p className="text-blue-700">
          Has dsaSheet: {lesson?.dsaSheet ? "YES" : "NO"}
        </p>
        <p className="text-blue-700">
          Categories: {lesson?.dsaSheet?.categories?.length || 0}
        </p>
      </div>

      {/* Debug Information */}
      <Card className="border-2 border-red-200 bg-red-50">
        <CardContent className="p-4">
          <h3 className="font-bold text-red-800 mb-2">
            🐛 DSA Sheet Debug Info
          </h3>
          <div className="text-sm space-y-1">
            <p>
              <strong>Lesson ID:</strong> {lesson?._id || "Not found"}
            </p>
            <p>
              <strong>Lesson Title:</strong> {lesson?.title || "Not found"}
            </p>
            <p>
              <strong>Lesson Type:</strong> {lesson?.type || "Not found"}
            </p>
            <p>
              <strong>Has dsaSheet:</strong> {lesson?.dsaSheet ? "Yes" : "No"}
            </p>
            <p>
              <strong>dsaSheet type:</strong> {typeof lesson?.dsaSheet}
            </p>
            <p>
              <strong>Categories count:</strong>{" "}
              {lesson?.dsaSheet?.categories?.length || 0}
            </p>
            <div className="mt-2 p-2 bg-gray-100 rounded">
              <p>
                <strong>Raw dsaSheet:</strong>
              </p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(lesson?.dsaSheet, null, 2)}
              </pre>
            </div>
            {lesson?.dsaSheet?.categories?.map((cat, i) => (
              <p key={i}>
                <strong>Category {i + 1}:</strong> {cat.title} (
                {cat.problems?.length || 0} problems)
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Header with Overall Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-blue-600" />
                <span>DSA Problem Sheet</span>
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Track your progress through data structures and algorithms
                problems
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold text-blue-600">
                  {overallProgress.completed}/{overallProgress.total}
                </span>
              </div>
              <Progress value={overallProgress.percentage} className="w-32" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Categories */}
      <div className="space-y-4">
        {!lesson.dsaSheet?.categories?.length ? (
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                ⚠️ No DSA Categories Found
              </h3>
              <p className="text-yellow-700 mb-4">
                This lesson doesn't have any DSA categories configured.
              </p>
              <div className="text-left bg-white p-4 rounded border text-sm">
                <p>
                  <strong>Raw lesson data:</strong>
                </p>
                <pre className="mt-2 overflow-auto">
                  {JSON.stringify(lesson, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        ) : (
          lesson.dsaSheet.categories.map((category, categoryIndex) => {
            const progress = getCategoryProgress(category);
            const isExpanded = expandedCategories.has(categoryIndex);

            return (
              <Card key={categoryIndex} className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCategory(categoryIndex)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">
                          {category.title}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-gray-600">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium">
                        {progress.completed}/{progress.total}
                      </span>
                      <Progress value={progress.percentage} className="w-24" />
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {category.problems?.map((problem, problemIndex) => {
                        const problemId = problem._id || problem.id;
                        const isCompleted = completedProblems.has(problemId);

                        return (
                          <div
                            key={problemId}
                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                              isCompleted
                                ? "bg-green-50 border-green-200"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <button
                              onClick={() =>
                                toggleProblemCompletion(
                                  problemId,
                                  categoryIndex,
                                  problemIndex
                                )
                              }
                              disabled={loading}
                              className="flex-shrink-0"
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4
                                  className={`font-medium ${
                                    isCompleted
                                      ? "line-through text-gray-500"
                                      : ""
                                  }`}
                                >
                                  {problem.title}
                                </h4>
                                <Badge
                                  className={`text-xs ${getDifficultyColor(
                                    problem.difficulty
                                  )}`}
                                >
                                  {problem.difficulty}
                                </Badge>
                              </div>
                              {problem.topic && (
                                <span className="text-xs text-gray-500">
                                  {problem.topic}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              {problem.leetcodeUrl && (
                                <Button size="sm" variant="outline" asChild>
                                  <a
                                    href={problem.leetcodeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    <span>Problem</span>
                                  </a>
                                </Button>
                              )}
                              {problem.solutionUrl && (
                                <Button size="sm" variant="ghost" asChild>
                                  <a
                                    href={problem.solutionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-1"
                                  >
                                    <span>Solution</span>
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
