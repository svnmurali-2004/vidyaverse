import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import User from '@/models/user.model';
import Course from '@/models/course.model';
import Enrollment from '@/models/enrollment.model';
import Order from '@/models/order.model';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get current month start and end dates
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Get previous month for comparison
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Current month stats
    const [
      usersThisMonth,
      coursesThisMonth,
      enrollmentsThisMonth,
      revenueThisMonth
    ] = await Promise.all([
      User.countDocuments({ 
        createdAt: { $gte: monthStart, $lte: monthEnd } 
      }),
      Course.countDocuments({ 
        createdAt: { $gte: monthStart, $lte: monthEnd } 
      }),
      Enrollment.countDocuments({ 
        createdAt: { $gte: monthStart, $lte: monthEnd } 
      }),
      Order.aggregate([
        {
          $match: {
            status: 'paid',
            createdAt: { $gte: monthStart, $lte: monthEnd }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ])
    ]);

    // Previous month stats for growth calculation
    const [
      usersPrevMonth,
      coursesPrevMonth,
      enrollmentsPrevMonth,
      revenuePrevMonth
    ] = await Promise.all([
      User.countDocuments({ 
        createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } 
      }),
      Course.countDocuments({ 
        createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } 
      }),
      Enrollment.countDocuments({ 
        createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } 
      }),
      Order.aggregate([
        {
          $match: {
            status: 'paid',
            createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ])
    ]);

    // Extract revenue values
    const thisMonthRevenue = revenueThisMonth[0]?.total || 0;
    const prevMonthRevenue = revenuePrevMonth[0]?.total || 0;

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const userGrowth = calculateGrowth(usersThisMonth, usersPrevMonth);
    const courseGrowth = calculateGrowth(coursesThisMonth, coursesPrevMonth);
    const enrollmentGrowth = calculateGrowth(enrollmentsThisMonth, enrollmentsPrevMonth);
    const revenueGrowth = calculateGrowth(thisMonthRevenue, prevMonthRevenue);

    return NextResponse.json({
      thisMonth: {
        users: usersThisMonth,
        courses: coursesThisMonth,
        enrollments: enrollmentsThisMonth,
        revenue: thisMonthRevenue
      },
      previousMonth: {
        users: usersPrevMonth,
        courses: coursesPrevMonth,
        enrollments: enrollmentsPrevMonth,
        revenue: prevMonthRevenue
      },
      growth: {
        users: userGrowth,
        courses: courseGrowth,
        enrollments: enrollmentGrowth,
        revenue: revenueGrowth
      }
    });
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly stats' },
      { status: 500 }
    );
  }
}
