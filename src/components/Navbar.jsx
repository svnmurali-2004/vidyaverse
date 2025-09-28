"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  BookOpen,
  LayoutDashboard,
  Award,
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <GraduationCap className="h-7 w-7 md:h-8 md:w-8 text-primary" />
              <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                VidyaVerse
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href
                    ? "text-primary"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {session ? (
              <>
                {/* Hide dashboard/admin buttons on mobile, show in dropdown instead */}
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      <span className="hidden lg:inline">Dashboard</span>
                      <span className="lg:hidden">Dashboard</span>
                    </Link>
                  </Button>

                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/courses">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span className="hidden lg:inline">Courses</span>
                      <span className="lg:hidden">Courses</span>
                    </Link>
                  </Button>

                  {session.user.role === "admin" && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/admin">
                        <Settings className="h-4 w-4 mr-2" />
                        <span className="hidden lg:inline">Admin</span>
                        <span className="lg:hidden">Admin</span>
                      </Link>
                    </Button>
                  )}
                </div>

                {/* User dropdown for desktop */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-primary/20 transition-all">
                        {session.user.image && !imageError ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-background">
                            <Image
                              src={session.user.image}
                              alt={session.user.name || "User"}
                              fill
                              className="object-cover"
                              onError={() => setImageError(true)}
                              sizes="32px"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-500 rounded-full flex items-center justify-center ring-2 ring-background shadow-sm">
                            <span className="text-white text-sm font-semibold">
                              {session.user.name?.charAt(0)?.toUpperCase() || session.user.email?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="flex flex-col space-y-1 p-2">
                        <p className="text-sm font-medium">{session.user.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/courses">
                          <BookOpen className="mr-2 h-4 w-4" />
                          My Courses
                        </Link>
                      </DropdownMenuItem>
                      {session.user.role === "admin" && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <Settings className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/certificates">
                          <Award className="mr-2 h-4 w-4" />
                          Certificates
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-10 w-10 border border-gray-200 dark:border-gray-700"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ease-out"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={`
          fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 
          shadow-2xl border-r border-gray-200 dark:border-gray-700 z-50 md:hidden
          transform transition-all duration-300 ease-out
          ${isMobileMenuOpen 
            ? 'translate-x-0 opacity-100' 
            : '-translate-x-full opacity-0'
          }
        `}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/5 to-blue-500/5">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-7 w-7 text-primary animate-pulse" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                VidyaVerse
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Sidebar Content */}
          <div className="flex flex-col h-full overflow-y-auto">
            {/* User Profile Section */}
            {session && (
              <div className="p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  {session.user.image && !imageError ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden ring-3 ring-white dark:ring-gray-800 shadow-lg">
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        fill
                        className="object-cover"
                        onError={() => setImageError(true)}
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-500 rounded-full flex items-center justify-center ring-3 ring-white dark:ring-gray-800 shadow-lg">
                      <span className="text-white text-lg font-bold">
                        {session.user.name?.charAt(0)?.toUpperCase() || session.user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {session.user.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session.user.email}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary capitalize">
                      {session.user.role}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-4 space-y-2">
              {/* Main Navigation */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                  Navigation
                </p>
                {navigation.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-3 rounded-xl text-sm font-medium 
                      transition-all duration-200 ease-out transform hover:scale-[1.02] hover:shadow-md
                      ${pathname === item.href
                        ? "bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-primary/25" 
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <span className={`mr-3 transition-transform duration-200 ${pathname === item.href ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {item.name === "Home" && "🏠"}
                      {item.name === "Courses" && "📚"}
                      {item.name === "About" && "ℹ️"}
                      {item.name === "Contact" && "📞"}
                    </span>
                    {item.name}
                    {pathname === item.href && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </Link>
                ))}
              </div>

              {/* Dashboard Links for Authenticated Users */}
              {session && (
                <div className="pt-4 space-y-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                    Dashboard
                  </p>
                  <Link
                    href="/dashboard"
                    className="group flex items-center px-3 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary hover:from-primary/20 hover:to-blue-500/20 transition-all duration-200 ease-out transform hover:scale-[1.02] hover:shadow-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    My Dashboard
                    <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-bounce" />
                  </Link>
                  
                  <Link
                    href="/courses"
                    className="group flex items-center px-3 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 ease-out transform hover:scale-[1.02] hover:shadow-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BookOpen className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    My Courses
                  </Link>

                  {session.user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="group flex items-center px-3 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 text-orange-600 dark:text-orange-400 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 transition-all duration-200 ease-out transform hover:scale-[1.02] hover:shadow-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      Admin Panel
                      <span className="ml-auto px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                        Admin
                      </span>
                    </Link>
                  )}
                </div>
              )}

              {/* User Actions */}
              {session && (
                <div className="pt-4 space-y-1 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                    Account
                  </p>
                  <Link
                    href="/profile"
                    className="group flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ease-out"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    Profile Settings
                  </Link>

                  <Link
                    href="/certificates"
                    className="group flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ease-out"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Award className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    My Certificates
                  </Link>
                </div>
              )}

              {/* Auth Actions */}
              <div className="pt-4 space-y-2 border-t border-gray-200 dark:border-gray-700 mt-auto">
                {session ? (
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="group flex items-center w-full px-3 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 text-red-600 dark:text-red-400 hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 transition-all duration-200 ease-out transform hover:scale-[1.02]"
                  >
                    <LogOut className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    Sign Out
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-xl"
                      asChild
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/signin">Sign In</Link>
                    </Button>
                    <Button
                      className="w-full rounded-xl bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 transition-all duration-200"
                      asChild
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </nav>
  );
}