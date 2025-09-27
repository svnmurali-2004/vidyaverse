"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileSidebar from "./MobileSidebar";
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

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                VidyaVerse
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md ${
                  pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop User Section */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {session ? (
              <>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary"
                    asChild
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      <span className="hidden xl:inline">Dashboard</span>
                      <span className="xl:hidden">📊</span>
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                    asChild
                  >
                    <Link href="/courses">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span className="hidden xl:inline">My Courses</span>
                      <span className="xl:hidden">📚</span>
                    </Link>
                  </Button>

                  {session.user.role === "admin" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40"
                      asChild
                    >
                      <Link href="/admin">
                        <Settings className="h-4 w-4 mr-2" />
                        <span className="hidden xl:inline">Admin Panel</span>
                        <span className="xl:hidden">Admin</span>
                      </Link>
                    </Button>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 px-2"
                      size="sm"
                    >
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {session.user.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {session.user.email}
                      </p>
                      <p className="text-xs text-primary font-medium capitalize">
                        {session.user.role}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="flex items-center cursor-pointer"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/certificates"
                        className="flex items-center cursor-pointer"
                      >
                        <Award className="mr-2 h-4 w-4" />
                        My Certificates
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-primary transition-all duration-200"
            >
              <div className="relative w-5 h-5">
                <Menu className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0 rotate-180 scale-75' : 'opacity-100 rotate-0 scale-100'
                }`} />
                <X className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-75'
                }`} />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          session={session}
          navigation={navigation}
          handleSignOut={handleSignOut}
        />
      </div>
    </nav>
  );
}