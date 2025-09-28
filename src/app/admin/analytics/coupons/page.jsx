"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Ticket,
  DollarSign,
  Users,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"];

export default function CouponAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [analytics, setAnalytics] = useState({
    overview: {
      totalCoupons: 0,
      activeCoupons: 0,
      totalUsage: 0,
      totalSavings: 0,
    },
    topCoupons: [],
    usageByMonth: [],
    savingsByType: [],
    recentUsage: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (session?.user) {
      fetchAnalytics();
    }
  }, [session, status, router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/coupons?days=${timeRange}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      } else {
        toast.error("Failed to load analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupon Analytics</h1>
          <p className="text-gray-600">Track coupon performance and usage trends</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Coupons</p>
                <p className="text-2xl font-bold">{analytics.overview.totalCoupons}</p>
              </div>
              <Ticket className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Coupons</p>
                <p className="text-2xl font-bold">{analytics.overview.activeCoupons}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold">{analytics.overview.totalUsage}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics.overview.totalSavings)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Usage by Month Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>
              Coupon usage over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.usageByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Savings by Type Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Savings by Type</CardTitle>
            <CardDescription>
              Distribution of savings by coupon type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.savingsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.savingsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Coupons */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Coupons</CardTitle>
          <CardDescription>
            Coupons with highest usage and savings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Usage Count</TableHead>
                <TableHead>Total Savings</TableHead>
                <TableHead>Avg. Discount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.topCoupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell>
                    <span className="font-mono font-medium">{coupon.code}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {coupon.type === "percentage" ? "%" : "₹"}
                    </Badge>
                  </TableCell>
                  <TableCell>{coupon.usageCount}</TableCell>
                  <TableCell>{formatCurrency(coupon.totalSavings)}</TableCell>
                  <TableCell>{formatCurrency(coupon.avgDiscount)}</TableCell>
                  <TableCell>
                    {coupon.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {analytics.topCoupons.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No coupon usage data found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Coupon Usage</CardTitle>
          <CardDescription>
            Latest coupon redemptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Coupon</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Final Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.recentUsage.map((usage) => (
                <TableRow key={usage._id}>
                  <TableCell>{formatDate(usage.usedAt)}</TableCell>
                  <TableCell>
                    <span className="font-mono">{usage.coupon.code}</span>
                  </TableCell>
                  <TableCell>{usage.user.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {usage.course.title}
                  </TableCell>
                  <TableCell>{formatCurrency(usage.discountAmount)}</TableCell>
                  <TableCell>{formatCurrency(usage.finalAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {analytics.recentUsage.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent coupon usage found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}