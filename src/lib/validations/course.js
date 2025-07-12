import { z } from "zod";

// Course validation schemas
export const createCourseSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  
  shortDescription: z.string()
    .min(10, "Short description must be at least 10 characters")
    .max(200, "Short description must be less than 200 characters"),
  
  description: z.string()
    .min(50, "Detailed description must be at least 50 characters")
    .max(5000, "Detailed description must be less than 5000 characters"),
  
  price: z.coerce.number()
    .min(0, "Price must be a positive number")
    .default(0),
  
  category: z.string()
    .min(1, "Category is required")
    .max(50, "Category must be less than 50 characters"),
  
  level: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select a difficulty level"
  }),
  
  thumbnail: z.string().url("Invalid URL").optional().or(z.literal("")),
  
  status: z.enum(["draft", "published"], {
    required_error: "Please select a status"
  }).default("draft"),
  
  slug: z.string().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

// Common course categories (can be expanded)
export const courseCategories = [
  "Web Development",
  "Mobile Development", 
  "Data Science",
  "Machine Learning",
  "Cloud Computing",
  "DevOps",
  "Cybersecurity",
  "UI/UX Design",
  "Digital Marketing",
  "Business",
  "Programming Languages",
  "Game Development",
  "Database Management",
  "Networking",
  "Software Testing",
];

// Course difficulty levels
export const courseLevels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

// Course status options
export const courseStatuses = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];
