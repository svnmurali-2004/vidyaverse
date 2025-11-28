"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CTAButton } from "@/components/ui/cta-button";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  BookOpen,
  Users,
  Trophy,
  Zap,
  Play,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Globe,
  Shield,
  Award,
  Target,
  Lightbulb,
  TrendingUp,
  Sparkles,
  GraduationCap
} from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalHours: 0,
  });

  useEffect(() => {
    // Fetch featured courses
    const fetchFeaturedCourses = async () => {
      try {
        // First try to get featured courses
        let response = await fetch("/api/courses?featured=true&limit=6");
        let data = await response.json();

        // If no featured courses found, fallback to latest courses
        if (response.ok && (!data.data || data.data.length === 0)) {
          console.log("No featured courses found, falling back to latest");
          response = await fetch("/api/courses?limit=6&sortOrder=desc");
          data = await response.json();
        }

        if (response.ok) {
          setFeaturedCourses(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching featured courses:", error);
      }
    };

    fetchFeaturedCourses();

    // Set mock stats (you can replace with real API calls)
    setStats({
      totalCourses: 500,
      totalStudents: 25000,
      totalInstructors: 150,
      totalHours: 10000,
    });
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero Section - Animated & Interactive */}
      <HeroHighlight containerClassName="items-start">
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20 lg:pt-12 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-8 text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>The Future of Online Learning</span>
              </motion.div>

              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                  Master New Skills <br />
                  <Highlight className="text-black dark:text-white">
                    Build Your Future
                  </Highlight>
                </h1>
                <TextGenerateEffect
                  words="Access world-class education from top instructors. Whether you want to learn programming, design, or business, VidyaVerse is your gateway to success."
                  className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                {session ? (
                  <Link href={session.user.role === "admin" ? "/admin" : "/courses"}>
                    <CTAButton className="w-full sm:w-auto text-lg h-14 px-8">
                      {session.user.role === "admin" ? "Admin Dashboard" : "Continue Learning"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </CTAButton>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <CTAButton className="w-full sm:w-auto text-lg h-14 px-8">
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </CTAButton>
                    </Link>
                    <Link href="/courses">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto h-14 px-8 text-lg border-2 border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all rounded-xl"
                      >
                        <Play className="mr-2 h-5 w-5 fill-current" />
                        Watch Demo
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm font-medium text-slate-500"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span>No Credit Card</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span>14-Day Free Trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span>Cancel Anytime</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-[2rem] transform rotate-3 scale-105 -z-10 animate-pulse"></div>
              <div className="relative bg-white rounded-[1.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden p-2">
                <div className="aspect-[4/3] rounded-2xl bg-slate-50 relative overflow-hidden group">
                  {/* Mock UI Interface */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto cursor-pointer"
                      >
                        <GraduationCap className="w-12 h-12 text-blue-600" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Interactive Learning</h3>
                        <p className="text-slate-500">Learn by doing with real projects</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute top-8 right-8 p-4 bg-white rounded-xl shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Course Completed</div>
                        <div className="font-bold text-slate-900">Web Development</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-8 left-8 p-4 bg-white rounded-xl shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600">
                            U{i}
                          </div>
                        ))}
                      </div>
                      <div className="text-sm font-medium text-slate-600">
                        +12k Students
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </HeroHighlight>

      {/* Stats Section */}
      <section className="py-10 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Total Courses", value: "500+", icon: BookOpen, color: "text-blue-600" },
              { label: "Active Students", value: "25k+", icon: Users, color: "text-indigo-600" },
              { label: "Expert Instructors", value: "150+", icon: Award, color: "text-purple-600" },
              { label: "Hours Content", value: "10k+", icon: Clock, color: "text-green-600" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-center gap-4"
              >
                <div className={`p-3 rounded-full bg-slate-50 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Featured Courses</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explore our most popular courses and start learning today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Link href={`/courses/${course._id}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden group">
                    <div className="h-48 bg-slate-200 relative overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <BookOpen className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/90 text-slate-900 hover:bg-white backdrop-blur-sm shadow-sm">
                          {course.level}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                          {course.category}
                        </Badge>
                        <div className="flex items-center text-amber-500 text-sm font-medium">
                          <Star className="h-4 w-4 fill-current mr-1" />
                          <span>4.8</span>
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{course.enrollmentCount || 0} students</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{course.duration || 0}h</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/courses">
              <Button variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-50"></div>
              <div className="relative grid grid-cols-2 gap-6">
                <Card className="p-6 border-none shadow-xl bg-white/80 backdrop-blur-sm hover:-translate-y-2 transition-transform duration-300">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Personalized Learning</h3>
                  <p className="text-sm text-slate-500">Tailored content to match your pace and goals.</p>
                </Card>
                <Card className="p-6 border-none shadow-xl bg-white/80 backdrop-blur-sm mt-12 hover:-translate-y-2 transition-transform duration-300">
                  <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Community Support</h3>
                  <p className="text-sm text-slate-500">Connect with peers and mentors worldwide.</p>
                </Card>
                <Card className="p-6 border-none shadow-xl bg-white/80 backdrop-blur-sm hover:-translate-y-2 transition-transform duration-300">
                  <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Certified Skills</h3>
                  <p className="text-sm text-slate-500">Earn recognized certificates for your achievements.</p>
                </Card>
                <Card className="p-6 border-none shadow-xl bg-white/80 backdrop-blur-sm mt-12 hover:-translate-y-2 transition-transform duration-300">
                  <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Interactive Quizzes</h3>
                  <p className="text-sm text-slate-500">Test your knowledge with engaging assessments.</p>
                </Card>
              </div>
            </motion.div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Why Choose VidyaVerse?
                </h2>
                <p className="text-lg text-slate-600">
                  We provide a comprehensive learning ecosystem designed to help you succeed in your career and personal growth.
                </p>
              </motion.div>

              <div className="space-y-6">
                {[
                  "Expert-led courses in trending technologies",
                  "Hands-on projects and real-world scenarios",
                  "Flexible learning schedule that fits your life",
                  "Career guidance and portfolio building"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <Link href="/about">
                  <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800">
                    Learn More About Us
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
