import CourseCard from "./CourseCard";

export default function CoursesGrid({ 
  courses, 
  wishlist, 
  onToggleWishlist, 
  onQuickPreview 
}) {
  if (courses.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course._id}
            course={course}
            wishlist={wishlist}
            onToggleWishlist={onToggleWishlist}
            onQuickPreview={onQuickPreview}
          />
        ))}
      </div>
    </section>
  );
}