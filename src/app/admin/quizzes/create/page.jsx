"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  BookOpen,
  Clock,
  Target,
  HelpCircle,
} from "lucide-react";

export default function CreateQuizPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    lesson: "",
    timeLimit: 30,
    passingScore: 70,
    attempts: 3,
    isActive: true,
    questions: [],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user?.role !== "admin") {
      router.push("/");
      return;
    }

    if (session) {
      fetchCourses();
    }
  }, [session, status, router]);

  useEffect(() => {
    if (formData.course) {
      fetchLessons(formData.course);
    } else {
      setLessons([]);
    }
  }, [formData.course]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses?admin=true");
      if (response.ok) {
        const data = await response.json();
        setCourses(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchLessons = async (courseId) => {
    try {
      const response = await fetch(`/api/lessons?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setLessons(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      question: "",
      type: "single-choice",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      correctAnswer: "",
      explanation: "",
      points: 1,
    };

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const removeQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const updateQuestion = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const addOption = (questionIndex) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: [...q.options, { text: "", isCorrect: false }],
            }
          : q
      ),
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.filter((_, oi) => oi !== optionIndex),
            }
          : q
      ),
    }));
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((opt, oi) =>
                oi === optionIndex ? { ...opt, [field]: value } : opt
              ),
            }
          : q
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.course) {
      toast.error("Please select a course");
      return;
    }

    if (formData.questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    // Validate each question has correct answers
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];

      if (!question.question.trim()) {
        toast.error(`Question ${i + 1} is missing question text`);
        return;
      }

      if (question.type === "fill-blank") {
        if (!question.correctAnswer.trim()) {
          toast.error(`Question ${i + 1} is missing the correct answer`);
          return;
        }
      } else {
        if (!question.options || question.options.length === 0) {
          toast.error(`Question ${i + 1} must have at least one option`);
          return;
        }

        const hasCorrectAnswer = question.options.some(
          (option) => option.isCorrect
        );
        if (!hasCorrectAnswer) {
          toast.error(
            `Question ${i + 1} must have at least one correct answer selected`
          );
          return;
        }

        // Check if all options have text
        const emptyOption = question.options.find(
          (option) => !option.text.trim()
        );
        if (emptyOption) {
          toast.error(`Question ${i + 1} has empty option text`);
          return;
        }
      }
    }

    setLoading(true);

    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Quiz created successfully");
        router.push("/admin/quizzes");
      } else {
        const error = await response.json();
        toast.error(error.error || error.message || "Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("Network error: Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Quiz</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new quiz for your course
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter quiz title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the quiz"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course">Course *</Label>
                <select
                  id="course"
                  value={formData.course}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      course: e.target.value,
                      lesson: "",
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="lesson">Lesson (Optional)</Label>
                <select
                  id="lesson"
                  value={formData.lesson}
                  onChange={(e) =>
                    setFormData({ ...formData, lesson: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  disabled={!formData.course}
                >
                  <option value="">Select a lesson</option>
                  {lessons.map((lesson) => (
                    <option key={lesson._id} value={lesson._id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Quiz Settings
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    max="180"
                    value={formData.timeLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeLimit: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passingScore: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="attempts">Max Attempts</Label>
                <Input
                  id="attempts"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.attempts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attempts: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">
                Active (students can take this quiz)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2" />
                Questions ({formData.questions.length})
              </CardTitle>
              <Button type="button" onClick={addQuestion} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {formData.questions.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No questions added yet
                </p>
                <Button type="button" onClick={addQuestion} className="mt-4">
                  Add Your First Question
                </Button>
              </div>
            ) : (
              formData.questions.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">
                      Question {questionIndex + 1}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(questionIndex)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div>
                    <Label>Question Text *</Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) =>
                        updateQuestion(
                          questionIndex,
                          "question",
                          e.target.value
                        )
                      }
                      placeholder="Enter your question"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Question Type</Label>
                      <select
                        value={question.type}
                        onChange={(e) =>
                          updateQuestion(questionIndex, "type", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="single-choice">Single Choice</option>
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="true-false">True/False</option>
                        <option value="fill-blank">Fill in the Blank</option>
                      </select>
                    </div>

                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={question.points}
                        onChange={(e) =>
                          updateQuestion(
                            questionIndex,
                            "points",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>

                  {question.type === "fill-blank" ? (
                    <div>
                      <Label>Correct Answer *</Label>
                      <Input
                        value={question.correctAnswer}
                        onChange={(e) =>
                          updateQuestion(
                            questionIndex,
                            "correctAnswer",
                            e.target.value
                          )
                        }
                        placeholder="Enter the correct answer"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <Label>Answer Options *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(questionIndex)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Option
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type={
                                question.type === "multiple-choice"
                                  ? "checkbox"
                                  : "radio"
                              }
                              name={`correct-${questionIndex}`}
                              checked={option.isCorrect}
                              onChange={(e) => {
                                if (
                                  question.type === "single-choice" ||
                                  question.type === "true-false"
                                ) {
                                  // For single choice, uncheck all others first
                                  const updatedOptions = question.options.map(
                                    (opt, i) => ({
                                      ...opt,
                                      isCorrect:
                                        i === optionIndex
                                          ? e.target.checked
                                          : false,
                                    })
                                  );
                                  updateQuestion(
                                    questionIndex,
                                    "options",
                                    updatedOptions
                                  );
                                } else {
                                  updateOption(
                                    questionIndex,
                                    optionIndex,
                                    "isCorrect",
                                    e.target.checked
                                  );
                                }
                              }}
                            />
                            <Input
                              value={option.text}
                              onChange={(e) =>
                                updateOption(
                                  questionIndex,
                                  optionIndex,
                                  "text",
                                  e.target.value
                                )
                              }
                              placeholder={`Option ${optionIndex + 1}`}
                              className="flex-1"
                            />
                            {question.options.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeOption(questionIndex, optionIndex)
                                }
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Explanation (Optional)</Label>
                    <Textarea
                      value={question.explanation}
                      onChange={(e) =>
                        updateQuestion(
                          questionIndex,
                          "explanation",
                          e.target.value
                        )
                      }
                      placeholder="Explain why this is the correct answer"
                      rows={2}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Creating..." : "Create Quiz"}
          </Button>
        </div>
      </form>
    </div>
  );
}
