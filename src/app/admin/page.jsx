"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChartAreaInteractive } from "@/components/sidebar/chart-area-interactive";
import { DataTable } from "@/components/sidebar/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  Play,
  Plus,
  Eye,
  FileText,
  Award,
  Clock,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    recentUsers: [],
    recentCourses: [],
    recentEnrollments: [],
  });
  const [monthlyStats, setMonthlyStats] = useState({
    thisMonth: { users: 0, courses: 0, enrollments: 0, revenue: 0 },
    growth: { users: 0, courses: 0, enrollments: 0, revenue: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Fetch various stats in parallel
      const [usersRes, coursesRes, enrollmentsRes, monthlyRes] =
        await Promise.all([
          fetch("/api/admin/stats/users").catch(() => ({
            ok: false,
            status: 0,
          })),
          fetch("/api/admin/stats/courses").catch(() => ({
            ok: false,
            status: 0,
          })),
          fetch("/api/admin/stats/enrollments").catch(() => ({
            ok: false,
            status: 0,
          })),
          fetch("/api/admin/stats/monthly").catch(() => ({
            ok: false,
            status: 0,
          })),
        ]);

      let users = { total: 0, recent: [] };
      let courses = { total: 0, recent: [] };
      let enrollments = { total: 0, recent: [], revenue: 0 };
      let monthly = {
        thisMonth: { users: 0, courses: 0, enrollments: 0, revenue: 0 },
        growth: { users: 0, courses: 0, enrollments: 0, revenue: 0 },
      };

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        users = usersData;
        console.log("Users data:", usersData);
      } else {
        console.warn("Failed to fetch users:", usersRes.status);
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        courses = coursesData;
        console.log("Courses data:", coursesData);
      } else {
        console.warn("Failed to fetch courses:", coursesRes.status);
      }

      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json();
        enrollments = enrollmentsData;
        console.log("Enrollments data:", enrollmentsData);
      } else {
        console.warn("Failed to fetch enrollments:", enrollmentsRes.status);
      }

      if (monthlyRes.ok) {
        const monthlyData = await monthlyRes.json();
        monthly = monthlyData;
        console.log("Monthly data:", monthlyData);
      } else {
        console.warn("Failed to fetch monthly stats:", monthlyRes.status);
      }

      setStats({
        totalUsers: users.total || 0,
        totalCourses: courses.total || 0,
        totalEnrollments: enrollments.total || 0,
        totalRevenue: enrollments.revenue || 0,
        recentUsers: Array.isArray(users.recent) ? users.recent : [],
        recentCourses: Array.isArray(courses.recent) ? courses.recent : [],
        recentEnrollments: Array.isArray(enrollments.recent)
          ? enrollments.recent
          : [],
      });

      setMonthlyStats(monthly);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Set minimal default data on error
      setStats({
        totalUsers: 0,
        totalCourses: 0,
        totalEnrollments: 0,
        totalRevenue: 0,
        recentUsers: [],
        recentCourses: [],
        recentEnrollments: [],
      });
      setMonthlyStats({
        thisMonth: { users: 0, courses: 0, enrollments: 0, revenue: 0 },
        growth: { users: 0, courses: 0, enrollments: 0, revenue: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  const adminData =
    stats.recentUsers.length > 0
      ? stats.recentUsers.map((user, index) => ({
          id: user.id || user._id?.toString() || `user-${index}`,
          name: user.name || "Unknown User",
          email: user.email || "No email",
          role: user.role || "student",
          status: user.status || "inactive",
          joinDate: user.joinDate || "Unknown",
        }))
      : [
          {
            id: "no-users",
            name: "No users found",
            email: "Create your first user",
            role: "student",
            status: "inactive",
            joinDate: "N/A",
          },
        ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening on your VidyaVerse platform.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {monthlyStats.thisMonth.users > 0
                  ? `+${monthlyStats.thisMonth.users} this month`
                  : "No new users this month"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {monthlyStats.thisMonth.courses > 0
                  ? `+${monthlyStats.thisMonth.courses} new this month`
                  : "No new courses this month"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Enrollments
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">
                {monthlyStats.growth.enrollments !== 0
                  ? `${monthlyStats.growth.enrollments > 0 ? "+" : ""}${
                      monthlyStats.growth.enrollments
                    }% growth`
                  : "No change this month"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {monthlyStats.thisMonth.revenue > 0
                  ? `₹${(monthlyStats.thisMonth.revenue / 1000).toFixed(
                      1
                    )}K this month`
                  : "No revenue this month"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 lg:px-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <Link
                  href="/admin/courses/create"
                  className="flex items-center space-x-3"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Create Course</h3>
                    <p className="text-sm text-muted-foreground">
                      Add new course
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <Link
                  href="/admin/quizzes/create"
                  className="flex items-center space-x-3"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Create Quiz</h3>
                    <p className="text-sm text-muted-foreground">
                      Add new quiz
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <Link
                  href="/admin/users"
                  className="flex items-center space-x-3"
                >
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Manage Users</h3>
                    <p className="text-sm text-muted-foreground">
                      View all users
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <Link
                  href="/admin/analytics"
                  className="flex items-center space-x-3"
                >
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">View Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Platform insights
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="px-4 lg:px-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Analytics Overview</h2>
          <p className="text-sm text-muted-foreground">
            User engagement and platform metrics
          </p>
        </div>
        <ChartAreaInteractive />
      </div>

      {/* Recent Activity & Users Table */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Courses
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/courses">
                    <Eye className="h-4 w-4 mr-1" />
                    View All
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentCourses.length > 0 ? (
                  stats.recentCourses.slice(0, 3).map((course, index) => (
                    <div
                      key={course._id || course.id || index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          by {course.instructor?.name || "Unknown Instructor"}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={course.isPublished ? "default" : "secondary"}
                        >
                          {course.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {course.enrollmentCount || 0} students
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No courses found
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      asChild
                    >
                      <Link href="/admin/courses/create">
                        Create First Course
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Platform Status
                  </span>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600"
                  >
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Payment Gateway
                  </span>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600"
                  >
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Email Service
                  </span>
                  <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-600"
                  >
                    Monitoring
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    CDN
                  </span>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600"
                  >
                    Optimal
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="px-4 lg:px-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Recent Users</h2>
          <p className="text-sm text-muted-foreground">
            Latest user registrations and activity
          </p>
        </div>
        <DataTable data={adminData} />
      </div>
    </>
  );
}
