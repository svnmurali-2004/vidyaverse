"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Timer,
  BookOpen,
  Trophy,
  RotateCcw,
} from "lucide-react";

export default function QuizTaker({ quiz, onComplete }) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60); // Convert to seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(new Date());
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const timeSpent = Math.floor((new Date() - startTime) / 1000);

      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(
        ([questionIndex, answer]) => ({
          questionIndex: parseInt(questionIndex),
          ...answer,
        })
      );

      const response = await fetch(`/api/quizzes/${quiz._id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: formattedAnswers,
          timeSpent,
          startedAt: startTime.toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setShowResults(true);

        if (data.attempt.passed) {
          toast.success(
            `Congratulations! You passed with ${data.attempt.percentage}%`
          );
        } else {
          toast.error(
            `You scored ${data.attempt.percentage}%. Keep practicing!`
          );
        }

        onComplete?.(data);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to submit quiz");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz._id, answers, startTime, isSubmitting, onComplete]);

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const isQuestionAnswered = (index) => {
    return answers[index] !== undefined;
  };

  if (showResults && results) {
    return <QuizResults results={results} quiz={quiz} />;
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                {quiz.title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm">
                <Timer className="h-4 w-4 mr-1" />
                <span
                  className={timeLeft < 300 ? "text-red-500 font-semibold" : ""}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>

              <Badge variant="outline">
                {getAnsweredCount()}/{quiz.questions.length} answered
              </Badge>
            </div>
          </div>

          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{question.question}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{question.type}</Badge>
            <Badge variant="outline">
              {question.points} point{question.points !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {question.type === "fill-blank" ? (
            <div className="space-y-4">
              <textarea
                className="w-full p-3 border rounded-md resize-none"
                rows={3}
                placeholder="Enter your answer..."
                value={answers[currentQuestion]?.textAnswer || ""}
                onChange={(e) =>
                  handleAnswerChange(currentQuestion, {
                    textAnswer: e.target.value,
                  })
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className="flex items-start space-x-3 p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <input
                    type={
                      question.type === "multiple-choice" ? "checkbox" : "radio"
                    }
                    name={`question-${currentQuestion}`}
                    checked={
                      question.type === "multiple-choice"
                        ? answers[currentQuestion]?.selectedOptions?.includes(
                            optionIndex
                          ) || false
                        : answers[currentQuestion]?.selectedOptions?.[0] ===
                          optionIndex
                    }
                    onChange={(e) => {
                      let selectedOptions;

                      if (question.type === "multiple-choice") {
                        const current =
                          answers[currentQuestion]?.selectedOptions || [];
                        if (e.target.checked) {
                          selectedOptions = [...current, optionIndex];
                        } else {
                          selectedOptions = current.filter(
                            (idx) => idx !== optionIndex
                          );
                        }
                      } else {
                        selectedOptions = e.target.checked ? [optionIndex] : [];
                      }

                      handleAnswerChange(currentQuestion, { selectedOptions });
                    }}
                    className="mt-1"
                  />
                  <span className="flex-1">{option.text}</span>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() =>
                setCurrentQuestion((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            <div className="flex space-x-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium ${
                    index === currentQuestion
                      ? "bg-primary text-primary-foreground"
                      : isQuestionAnswered(index)
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestion === quiz.questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            ) : (
              <Button
                onClick={() =>
                  setCurrentQuestion((prev) =>
                    Math.min(quiz.questions.length - 1, prev + 1)
                  )
                }
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warning for time */}
      {timeLeft < 300 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Less than 5 minutes remaining!
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function QuizResults({ results, quiz }) {
  const { attempt, questions } = results;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Results Summary */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {attempt.passed ? (
              <Trophy className="h-16 w-16 text-yellow-500" />
            ) : (
              <RotateCcw className="h-16 w-16 text-gray-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {attempt.passed ? "Congratulations!" : "Keep Practicing!"}
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            You scored {attempt.percentage}% on {quiz.title}
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{attempt.score}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{attempt.percentage}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Percentage
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.floor(attempt.timeSpent / 60)}m
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Time Spent
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">{attempt.attemptNumber}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Attempt
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex justify-center">
            <Badge
              variant={attempt.passed ? "default" : "secondary"}
              className="text-lg px-4 py-2"
            >
              {attempt.passed ? "PASSED" : "FAILED"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => {
            const userAnswer = question.userAnswer;
            const isCorrect = userAnswer?.isCorrect;

            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium">
                    Question {index + 1}: {question.question}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <Badge variant={isCorrect ? "default" : "secondary"}>
                      {userAnswer?.pointsEarned || 0}/{question.points}
                    </Badge>
                  </div>
                </div>

                {question.type === "fill-blank" ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Your answer:</strong>{" "}
                      {userAnswer?.textAnswer || "No answer"}
                    </p>
                    <p>
                      <strong>Correct answer:</strong> {question.correctAnswer}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => {
                      const isSelected =
                        userAnswer?.selectedOptions?.includes(optionIndex);
                      const isCorrectOption = option.isCorrect;

                      return (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded border ${
                            isCorrectOption
                              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                              : isSelected && !isCorrectOption
                              ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                              : "bg-gray-50 dark:bg-gray-800"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {isSelected && (
                              <span className="text-blue-500">✓</span>
                            )}
                            {isCorrectOption && (
                              <span className="text-green-500">✓</span>
                            )}
                            <span>{option.text}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {question.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="text-sm">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
