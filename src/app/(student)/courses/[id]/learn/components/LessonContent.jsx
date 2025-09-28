"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/VideoPlayer";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  BookOpen,
  FileText,
  MessageSquare,
  Download,
} from "lucide-react";

const LessonContent = ({ 
  currentLesson, 
  isPreviewMode, 
  completedLessons, 
  markLessonComplete 
}) => {
  if (!currentLesson) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Select a lesson to start learning
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a lesson from the sidebar to begin your learning journey.
        </p>
      </div>
    );
  }

  const isCompleted = completedLessons.has(currentLesson._id);

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {currentLesson.title}
        </h1>
        {currentLesson.description && (
          <p className="text-gray-600 dark:text-gray-400">
            {currentLesson.description}
          </p>
        )}
        
        {/* Complete Lesson Button */}
        {!isPreviewMode && !isCompleted && (
          <div className="mt-4">
            <Button
              onClick={() => markLessonComplete(currentLesson._id)}
              className="bg-green-600 hover:bg-green-700"
            >
              Mark as Complete
            </Button>
          </div>
        )}

        {isCompleted && (
          <div className="mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              ✓ Completed
            </span>
          </div>
        )}
      </div>

      {/* Video Player - Outside tabs for better mobile experience */}
      {currentLesson.type === "video" && currentLesson.videoUrl && (
        <div className="w-full -mx-3 sm:mx-0">
          <div className="w-full aspect-[16/11] sm:aspect-video bg-black rounded-none sm:rounded-lg overflow-hidden shadow-lg">
            <VideoPlayer
              videoUrl={currentLesson.videoUrl}
              title={currentLesson.title}
              className="w-full h-full"
              onEnded={() => {
                if (!isPreviewMode && !isCompleted) {
                  markLessonComplete(currentLesson._id);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Lesson Content Tabs */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Card>
            <CardContent className="p-6">
              {/* Additional Notes for Video Lessons */}
              {currentLesson.type === "video" && currentLesson.content && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Additional Notes
                  </h3>
                  <MarkdownRenderer 
                    content={currentLesson.content}
                    className="prose max-w-none dark:prose-invert"
                  />
                </div>
              )}

              {/* Text Lesson Content */}
              {currentLesson.type === "text" && (
                <div className="space-y-4">
                  {currentLesson.content ? (
                    <MarkdownRenderer 
                      content={currentLesson.content}
                      className="prose max-w-none dark:prose-invert"
                    />
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <BookOpen className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Text Lesson
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {currentLesson.description || "This is a text-based lesson. Please read through the material carefully and take notes as needed."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Default fallback for lessons without content */}
              {currentLesson.type === "video" && !currentLesson.content && (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Video Lesson
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Watch the video above to learn about this topic.
                  </p>
                </div>
              )}

              {/* Default fallback for other lesson types */}
              {!["video", "text"].includes(currentLesson.type) && !currentLesson.content && !currentLesson.description && (
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
                  Connect with other students and share your thoughts.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LessonContent;