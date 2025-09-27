"use client";

import { Button } from "@/components/ui/button";
import { SkipBack, SkipForward } from "lucide-react";

const LessonNavigation = ({
  lessons,
  currentLesson,
  selectLesson,
  isPreviewMode,
}) => {
  if (!currentLesson || lessons.length === 0) {
    return null;
  }

  const getCurrentIndex = () => {
    return lessons.findIndex((l) => l._id === currentLesson._id);
  };

  const getNextLesson = () => {
    const currentIndex = getCurrentIndex();
    return currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  };

  const getPreviousLesson = () => {
    const currentIndex = getCurrentIndex();
    return currentIndex > 0 ? lessons[currentIndex - 1] : null;
  };

  const previousLesson = getPreviousLesson();
  const nextLesson = getNextLesson();

  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
      <div>
        {previousLesson && (
          <Button
            variant="outline"
            onClick={() => selectLesson(previousLesson)}
            className="flex items-center space-x-2"
          >
            <SkipBack className="h-4 w-4" />
            <div className="text-left">
              <div className="text-xs text-gray-500">Previous</div>
              <div className="font-medium truncate max-w-[150px]">
                {previousLesson.title}
              </div>
            </div>
          </Button>
        )}
      </div>
      
      <div className="text-center">
        <div className="text-sm text-gray-500">
          Lesson {getCurrentIndex() + 1} of {lessons.length}
        </div>
      </div>

      <div>
        {nextLesson && (
          <Button
            onClick={() => selectLesson(nextLesson)}
            disabled={isPreviewMode && !nextLesson?.isPreview}
            className="flex items-center space-x-2"
          >
            <div className="text-right">
              <div className="text-xs text-gray-200">Next</div>
              <div className="font-medium truncate max-w-[150px]">
                {nextLesson.title}
              </div>
            </div>
            <SkipForward className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default LessonNavigation;