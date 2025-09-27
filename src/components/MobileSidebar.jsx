"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  X,
  User,
  LogOut,
  Settings,
  BookOpen,
  LayoutDashboard,
  Award,
} from "lucide-react";

export default function MobileSidebar({ isOpen, onClose, session, navigation, handleSignOut }) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden transform transition-all duration-500 ease-out ${
        isOpen ? 'translate-x-0 scale-100' : '-translate-x-full scale-95'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 transform transition-all duration-400 ${
            isOpen ? 'translate-x-0 opacity-100 delay-75' : '-translate-x-8 opacity-0'
          }`}>
            <div className="flex items-center space-x-2">
              <GraduationCap className={`h-7 w-7 text-primary transition-all duration-300 ${
                isOpen ? 'rotate-0 scale-100' : 'rotate-45 scale-75'
              }`} />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                VidyaVerse
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className={`h-8 w-8 transition-all duration-200 hover:scale-110 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 ${
                isOpen ? 'rotate-0' : 'rotate-90'
              }`}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-2">
              {navigation.map((item, index) => {
                const delayClass = index === 0 ? 'delay-100' : index === 1 ? 'delay-150' : index === 2 ? 'delay-200' : 'delay-250';
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-3 text-base font-medium transition-all duration-300 hover:text-primary rounded-lg transform ${
                      isOpen 
                        ? `translate-x-0 opacity-100 ${delayClass}` 
                        : '-translate-x-4 opacity-0'
                    } ${
                      pathname === item.href
                        ? "text-primary bg-primary/10"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={onClose}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {/* Dashboard/Courses link for authenticated users */}
              {session && (
                <div className={`border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 transform transition-all duration-500 ${
                  isOpen ? 'translate-x-0 opacity-100 delay-300' : '-translate-x-4 opacity-0'
                }`}>
                  <Link
                    href="/dashboard"
                    className="flex items-center px-3 py-3 text-base font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-all duration-300"
                    onClick={onClose}
                  >
                    <LayoutDashboard className="mr-3 h-5 w-5" />
                    📊 My Dashboard
                  </Link>
                  <Link
                    href="/courses"
                    className="flex items-center px-3 py-3 mt-2 text-base font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition-all duration-300"
                    onClick={onClose}
                  >
                    <BookOpen className="mr-3 h-5 w-5" />
                    📚 My Courses
                  </Link>
                  {session.user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center px-3 py-3 mt-2 text-base font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40 rounded-lg transition-all duration-300"
                      onClick={onClose}
                    >
                      <Settings className="mr-3 h-5 w-5" />
                      ⚙️ Admin Panel
                    </Link>
                  )}
                </div>
              )}
            </nav>
          </div>

          {/* User Section */}
          {session ? (
            <div className={`border-t border-gray-200 dark:border-gray-700 p-4 transform transition-all duration-500 ${
              isOpen ? 'translate-y-0 opacity-100 delay-400' : 'translate-y-4 opacity-0'
            }`}>
              <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-semibold">
                    {session.user.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {session.user.email}
                  </p>
                  <p className="text-xs text-primary font-medium capitalize">
                    {session.user.role}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={onClose}
                >
                  <User className="mr-3 h-4 w-4" />
                  Profile Settings
                </Link>

                <Link
                  href="/certificates"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={onClose}
                >
                  <Award className="mr-3 h-4 w-4" />
                  My Certificates
                </Link>

                <button
                  onClick={() => {
                    handleSignOut();
                    onClose();
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className={`border-t border-gray-200 dark:border-gray-700 p-4 space-y-2 transform transition-all duration-500 ${
              isOpen ? 'translate-y-0 opacity-100 delay-400' : 'translate-y-4 opacity-0'
            }`}>
              <Button
                variant="ghost"
                className="w-full justify-start transition-all duration-200 hover:scale-105"
                asChild
                onClick={onClose}
              >
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button
                className="w-full transition-all duration-200 hover:scale-105"
                asChild
                onClick={onClose}
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}