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
  const { data: session } = useSession();
  const [expandedCategories, setExpandedCategories] = useState(new Set());
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

    setLoading(true);
    const isCompleted = completedProblems.has(problemId);

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

      if (response.ok) {
        const newCompleted = new Set(completedProblems);
        if (isCompleted) {
          newCompleted.delete(problemId);
          toast.success("Problem unmarked!");
        } else {
          newCompleted.add(problemId);
          toast.success("Problem completed! 🎉");
        }
        setCompletedProblems(newCompleted);

        if (onProgressUpdate) {
          onProgressUpdate(newCompleted.size, getTotalProblems());
        }
      }
    } catch (error) {
      toast.error("Failed to update progress");
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
      category.problems?.filter((problem) => completedProblems.has(problem.id))
        .length || 0;
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
        {lesson.dsaSheet?.categories?.map((category, categoryIndex) => {
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
                      const isCompleted = completedProblems.has(problem.id);

                      return (
                        <div
                          key={problem.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                            isCompleted
                              ? "bg-green-50 border-green-200"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <button
                            onClick={() =>
                              toggleProblemCompletion(
                                problem.id,
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
        })}
      </div>
    </div>
  );
}
