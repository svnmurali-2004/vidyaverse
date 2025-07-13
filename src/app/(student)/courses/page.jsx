'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Star, 
  Users, 
  User,
  Clock,
  BookOpen,
  Play,
  Eye,
  Heart,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function CoursesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [priceFilter, setPriceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    fetchCourses();
    fetchFeaturedCourses();
    if (session) {
      fetchWishlist();
    }
  }, [searchTerm, categoryFilter, levelFilter, sortBy, priceFilter, currentPage, session]);

  // Refetch data when user returns to the page (after payment, etc.)
  useEffect(() => {
    const handleFocus = () => {
      // Small delay to ensure any background API calls have completed
      setTimeout(() => {
        fetchCourses();
        if (session) {
          fetchWishlist();
        }
      }, 1000);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [session]);

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        category: categoryFilter !== 'all' ? categoryFilter : '',
        level: levelFilter !== 'all' ? levelFilter : '',
        sortBy,
        published: 'true',
        page: currentPage.toString(),
        limit: '12'
      });

      if (priceFilter === 'free') {
        params.append('price', '0');
      } else if (priceFilter === 'paid') {
        params.append('minPrice', '1');
      }

      const response = await fetch(`/api/courses?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedCourses = async () => {
    try {
      const response = await fetch('/api/courses?featured=true&limit=6');
      if (response.ok) {
        const data = await response.json();
        setFeaturedCourses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching featured courses:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/users/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlist(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const toggleWishlist = async (courseId) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const isInWishlist = wishlist.includes(courseId);
      const response = await fetch('/api/users/wishlist', {
        method: isInWishlist ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });

      if (response.ok) {
        setWishlist(prev => 
          isInWishlist 
            ? prev.filter(id => id !== courseId)
            : [...prev, courseId]
        );
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const enrollInCourse = async (courseId, isFree) => {
    if (!session) {
      // Redirect to login
      router.push('/auth/signin');
      return;
    }

    try {
      if (isFree) {
        // Free enrollment
        const response = await fetch('/api/enrollments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId })
        });

        if (response.ok) {
          router.push(`/courses/${courseId}/learn`);
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to enroll');
        }
      } else {
        // Paid enrollment - redirect to payment
        router.push(`/courses/${courseId}/checkout`);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course');
    }
  };

  const categories = [
    'all', 'Web Development', 'Mobile Development', 'Data Science', 
    'Machine Learning', 'Cloud Computing', 'DevOps', 'Cybersecurity',
    'UI/UX Design', 'Digital Marketing', 'Business', 'Photography'
  ];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Explore Our Courses
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Discover new skills, advance your career, and unlock your potential with our comprehensive course library
        </p>
      </div>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Courses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.slice(0, 3).map((course) => (
              <Card key={course._id} className="overflow-hidden hover:shadow-lg transition-shadow border-yellow-200 dark:border-yellow-800">
                <div className="relative">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  )}
                  <Badge className="absolute top-2 left-2 bg-yellow-500 text-black">
                    <Award className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => toggleWishlist(course._id)}
                  >
                    <Heart 
                      className={`h-4 w-4 ${wishlist.includes(course._id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                    />
                  </Button>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.shortDescription || course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {course.enrollmentCount || 0}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {course.avgRating?.toFixed(1) || 'New'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-green-600">
                        {course.price === 0 ? 'Free' : `₹${course.price}`}
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/courses/${course._id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        
                        {course.isEnrolled ? (
                          <Button size="sm" asChild>
                            <Link href={`/courses/${course._id}/learn`}>
                              <Play className="h-4 w-4 mr-1" />
                              Continue
                            </Link>
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => enrollInCourse(course._id, course.price === 0)}
                          >
                            {course.price === 0 ? 'Start Free' : 'Enroll Now'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search courses, skills, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Latest</SelectItem>
                <SelectItem value="enrollmentCount">Most Popular</SelectItem>
                <SelectItem value="avgRating">Highest Rated</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="-price">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchTerm}
              <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-red-500">×</button>
            </Badge>
          )}
          {categoryFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Category: {categoryFilter}
              <button onClick={() => setCategoryFilter('all')} className="ml-1 hover:text-red-500">×</button>
            </Badge>
          )}
          {levelFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Level: {levelFilter}
              <button onClick={() => setLevelFilter('all')} className="ml-1 hover:text-red-500">×</button>
            </Badge>
          )}
          {priceFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Price: {priceFilter}
              <button onClick={() => setPriceFilter('all')} className="ml-1 hover:text-red-500">×</button>
            </Badge>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <Card key={course._id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="relative">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              
              {course.isFeatured && (
                <Badge className="absolute top-2 left-2 bg-yellow-500 text-black">
                  <Award className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}

              <Badge 
                className="absolute top-2 right-10" 
                variant={course.level === 'beginner' ? 'secondary' : course.level === 'advanced' ? 'destructive' : 'default'}
              >
                {course.level}
              </Badge>

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={() => toggleWishlist(course._id)}
              >
                <Heart 
                  className={`h-4 w-4 ${wishlist.includes(course._id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                />
              </Button>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2 hover:text-blue-600 transition-colors">
                <Link href={`/courses/${course._id}`}>
                  {course.title}
                </Link>
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {course.shortDescription || course.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Instructor */}
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <User className="h-4 w-4 mr-2" />
                  {course.instructor?.name || 'Instructor'}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.enrollmentCount || 0} students
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.actualLessonCount || course.lessons?.length || 0} lessons
                  </div>
                </div>

                {/* Rating */}
                {course.avgRating && (
                  <div className="flex items-center text-sm">
                    <div className="flex items-center mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(course.avgRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {course.avgRating.toFixed(1)} ({course.reviewCount || 0} reviews)
                    </span>
                  </div>
                )}

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-2xl font-bold">
                    {course.price === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span className="text-blue-600">₹{course.price}</span>
                    )}
                  </div>
                  
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/courses/${course._id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    
                    {course.isEnrolled ? (
                      <Button size="sm" asChild>
                        <Link href={`/courses/${course._id}/learn`}>
                          <Play className="h-4 w-4 mr-1" />
                          Continue
                        </Link>
                      </Button>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => enrollInCourse(course._id, course.price === 0)}
                        className={course.price === 0 ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        {course.price === 0 ? 'Start Free' : 'Enroll Now'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quick Preview */}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Category: {course.category || 'General'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (page > totalPages) return null;
              
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* No Results */}
      {courses.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Try adjusting your search criteria or browse our featured courses
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            setCategoryFilter('all');
            setLevelFilter('all');
            setPriceFilter('all');
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
