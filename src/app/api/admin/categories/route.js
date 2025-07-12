import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Course from "@/models/course.model";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all unique categories with course counts
    const categoryStats = await Course.aggregate([
      {
        $group: {
          _id: "$category",
          courseCount: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          totalEnrollments: { $sum: "$enrollmentCount" },
        },
      },
      {
        $match: {
          _id: { $ne: null }, // Exclude courses with null/undefined category
        },
      },
      {
        $sort: { courseCount: -1 },
      },
    ]);

    // Transform the data to include additional information
    const categories = categoryStats.map((category, index) => ({
      id: category._id.toLowerCase().replace(/\s+/g, "-") + "-" + index,
      name: category._id,
      courseCount: category.courseCount,
      avgPrice: Math.round(category.avgPrice || 0),
      totalEnrollments: category.totalEnrollments || 0,
      description: generateCategoryDescription(category._id),
    }));

    return NextResponse.json({
      success: true,
      data: categories,
      total: categories.length,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// Helper function to generate descriptions for categories
function generateCategoryDescription(categoryName) {
  const descriptions = {
    "Web Development":
      "Frontend and backend web technologies, frameworks, and tools",
    "Mobile Development":
      "iOS and Android app development, React Native, Flutter",
    "Data Science":
      "Data analysis, machine learning, AI, and statistical modeling",
    "Cloud Computing":
      "AWS, Azure, Google Cloud, and cloud-native technologies",
    DevOps:
      "CI/CD, automation, containerization, and infrastructure management",
    Cybersecurity:
      "Security best practices, ethical hacking, and threat management",
    "UI/UX Design":
      "User interface design, user experience, and design thinking",
    "Digital Marketing":
      "SEO, social media marketing, content strategy, and analytics",
    Business: "Entrepreneurship, management, finance, and business strategy",
    Photography: "Digital photography, photo editing, and visual storytelling",
    "Machine Learning":
      "Artificial intelligence, neural networks, and predictive modeling",
    Programming: "Software development, algorithms, and programming languages",
  };

  return (
    descriptions[categoryName] || `Comprehensive courses in ${categoryName}`
  );
}
