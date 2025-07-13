"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Award,
  BookOpen,
  Target,
  AlertTriangle,
} from "lucide-react";

export default function CertificateRequirements({ courseId }) {
  const [requirements, setRequirements] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchRequirements();
    }
  }, [courseId]);

  const fetchRequirements = async () => {
    try {
      const response = await fetch(
        `/api/courses/${courseId}/certificate-requirements`
      );
      if (response.ok) {
        const data = await response.json();
        setRequirements(data.data);
      }
    } catch (error) {
      console.error("Error fetching certificate requirements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Certificate Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!requirements) {
    return null;
  }

  const { lessons, quizzes, certificateEligible } = requirements;

  return (
    <Card
      className={`border-2 ${
        certificateEligible
          ? "border-green-200 bg-green-50"
          : "border-amber-200 bg-amber-50"
      }`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Certificate Requirements
          </div>
          {certificateEligible ? (
            <Badge className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Eligible
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-amber-500 text-amber-700"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Requirements Pending
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lesson Requirements */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              <span className="font-medium">Lesson Completion</span>
            </div>
            {lessons.percentage >= lessons.required ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <Progress value={lessons.percentage} className="h-2" />
          <p className="text-sm text-gray-600">
            {lessons.completed}/{lessons.total} lessons completed (
            {lessons.percentage.toFixed(1)}% - Required: {lessons.required}%)
          </p>
        </div>

        {/* Quiz Requirements */}
        {quizzes.total > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                <span className="font-medium">Required Quizzes</span>
              </div>
              {quizzes.passed === quizzes.total ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>

            <p className="text-sm text-gray-600">
              {quizzes.passed}/{quizzes.total} required quizzes passed
            </p>

            <div className="space-y-2">
              {quizzes.requirements.map((req) => (
                <div
                  key={req.quiz._id}
                  className="flex items-center justify-between p-2 bg-white rounded border"
                >
                  <div>
                    <p className="font-medium text-sm">{req.quiz.title}</p>
                    <p className="text-xs text-gray-500">
                      Passing Score: {req.quiz.passingScore}% | Attempts:{" "}
                      {req.attemptsUsed}/{req.quiz.attempts}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {req.passed ? (
                      <Badge className="bg-green-600">
                        Passed ({req.bestScore}%)
                      </Badge>
                    ) : req.attemptsUsed > 0 ? (
                      <Badge variant="destructive">
                        Failed ({req.lastAttempt?.percentage || 0}%)
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Attempted</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificate Status */}
        <div
          className={`p-3 rounded border-2 ${
            certificateEligible
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          {certificateEligible ? (
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="font-medium text-green-800">
                  You're eligible for a certificate!
                </p>
                <p className="text-sm text-green-600">
                  Complete the course to automatically generate your
                  certificate.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
              <div>
                <p className="font-medium text-amber-800">
                  Certificate requirements not yet met
                </p>
                <p className="text-sm text-amber-600">
                  Complete the requirements above to earn your certificate.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
