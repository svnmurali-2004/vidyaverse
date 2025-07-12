"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EnrollmentChart,
  RevenueChart,
  UserActivityChart,
} from "@/components/charts/Analytics";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  DollarSign,
  Users,
  BookOpen,
  Award,
  Target,
  Clock,
} from "lucide-react";

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

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
      fetchAnalytics();
    }
  }, [session, status, router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?period=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      } else {
        console.error("Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const overview = analytics?.overview || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <BarChart3 className="h-8 w-8 mr-3" />
            Analytics & Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights into your platform performance
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">
                  ${(overview.totalRevenue || 0).toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">
                    Recent: ${(overview.recentRevenue || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Enrollments
                </p>
                <p className="text-2xl font-bold">
                  {overview.totalEnrollments || 0}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">
                    Recent: {overview.recentEnrollments || 0}
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-bold">{overview.totalUsers || 0}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">
                    Recent: {overview.recentUsers || 0}
                  </span>
                </div>
              </div>
              <BookOpen className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Courses
                </p>
                <p className="text-2xl font-bold">
                  {overview.totalCourses || 0}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">
                    Published courses
                  </span>
                </div>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <UserActivityChart data={analytics?.charts?.userGrowth || []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.distributions?.userRoles?.map((role) => (
                    <div
                      key={role._id}
                      className="flex justify-between items-center"
                    >
                      <span className="font-medium capitalize">
                        {role._id || "Unknown"}
                      </span>
                      <span className="font-bold">{role.count}</span>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">
                      No user role data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <EnrollmentChart
                  data={analytics?.charts?.enrollmentData || []}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Courses by Enrollment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topCourses?.slice(0, 5).map((course, index) => (
                    <div
                      key={course._id}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium truncate max-w-[200px]">
                          {course.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${course.price} per enrollment
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {course.enrollmentCount} enrollments
                        </p>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">
                      No course data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart data={analytics?.charts?.revenueData || []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.distributions?.courseCategories?.map(
                    (category) => (
                      <div
                        key={category._id}
                        className="flex justify-between items-center"
                      >
                        <span className="font-medium">
                          {category._id || "Uncategorized"}
                        </span>
                        <span className="font-bold">
                          {category.count} courses
                        </span>
                      </div>
                    )
                  ) || (
                    <p className="text-gray-500 text-center py-4">
                      No category data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
