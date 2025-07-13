import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 p-3 bg-orange-100 dark:bg-orange-900 rounded-full w-fit">
            <svg className="h-8 w-8 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L5.636 18.364M12 2L2 12h3l7-7 7 7h3L12 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">You're Offline</h1>
        </div>
        <div className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            No internet connection detected. Some features may not be available,
            but you can still access your downloaded content.
          </p>

          <div className="space-y-2">
            <Link 
              href="/student/dashboard"
              className="inline-flex items-center justify-center w-full h-9 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>

            <Link 
              href="/student/courses"
              className="inline-flex items-center justify-center w-full h-9 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              My Courses
            </Link>
          </div>

          <div className="pt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>VidyaVerse works offline with cached content</p>
          </div>
        </div>
      </div>
    </div>
  );
}
