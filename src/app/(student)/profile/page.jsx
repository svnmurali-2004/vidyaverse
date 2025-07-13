"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Award,
  BookOpen,
  Calendar,
  Trophy,
  Clock,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    profession: "",
    interests: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (session?.user) {
      fetchUserProfile();
      fetchEnrollments();
      fetchCertificates();
    }
  }, [session, status]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${session.user.id}`);
      if (response.ok) {
        const result = await response.json();
        const userData = result.data || result; // Handle both response formats
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          location: userData.location || "",
          bio: userData.bio || "",
          profession: userData.profession || "",
          interests: userData.interests || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      console.log("Fetching enrollments...");
      const response = await fetch("/api/enrollments");
      if (response.ok) {
        const result = await response.json();
        console.log("Enrollments API response:", result); // Debug log
        const enrollmentData = result.data || result.enrollments || [];
        console.log("Setting enrollments:", enrollmentData);
        setEnrollments(enrollmentData);
      } else {
        console.error("Failed to fetch enrollments:", response.statusText);
        toast.error("Failed to load enrollment data");
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast.error("Failed to load enrollment data");
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await fetch("/api/certificates");
      if (response.ok) {
        const result = await response.json();
        setCertificates(result.certificates || result.data || []);
      } else {
        console.error("Failed to fetch certificates:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedUser = result.data || result; // Handle both response formats
        setUser(updatedUser);
        setEditing(false);
        toast.success("Profile updated successfully");
      } else {
        const errorResult = await response.json();
        toast.error(errorResult.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      bio: user?.bio || "",
      profession: user?.profession || "",
      interests: user?.interests || "",
    });
    setEditing(false);
  };

  const calculateProgress = (enrollment) => {
    // Debug log to understand the data structure
    console.log("Calculating progress for enrollment:", enrollment);
    
    // Try multiple approaches to get progress
    if (enrollment.progressPercentage !== undefined) {
      return Math.round(enrollment.progressPercentage);
    }
    
    // Calculate from completed vs total lessons if available
    if (enrollment.completedLessons !== undefined && enrollment.totalLessons > 0) {
      const percentage = (enrollment.completedLessons / enrollment.totalLessons) * 100;
      return Math.round(percentage);
    }
    
    // Fallback to enrollment progress field
    if (enrollment.progress !== undefined) {
      return Math.round(enrollment.progress);
    }
    
    // Default to 0
    return 0;
  };

  const handleDownloadCertificate = async (certificateId) => {
    try {
      const response = await fetch(
        `/api/certificates/${certificateId}/download`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `certificate-${certificateId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Certificate downloaded successfully");
      } else {
        toast.error("Failed to download certificate");
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.error("Failed to download certificate");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account information and learning progress
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10">
                      <User className="h-8 w-8 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{user?.name}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      {user?.email}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {user?.role || "Student"}
                    </Badge>
                  </div>
                </div>

                {!editing ? (
                  <Button onClick={() => setEditing(true)} variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <div className="flex items-center mt-1">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      {editing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="flex-1"
                        />
                      ) : (
                        <span className="text-gray-900 dark:text-gray-100">
                          {user?.name || "Not provided"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-gray-100">
                        {user?.email}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <div className="flex items-center mt-1">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      {editing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="flex-1"
                        />
                      ) : (
                        <span className="text-gray-900 dark:text-gray-100">
                          {user?.phone || "Not provided"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      {editing ? (
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: e.target.value,
                            })
                          }
                          className="flex-1"
                        />
                      ) : (
                        <span className="text-gray-900 dark:text-gray-100">
                          {user?.location || "Not provided"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profession">Profession</Label>
                    {editing ? (
                      <Input
                        id="profession"
                        value={formData.profession}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            profession: e.target.value,
                          })
                        }
                        placeholder="e.g., Software Developer"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 mt-1">
                        {user?.profession || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="interests">Interests</Label>
                    {editing ? (
                      <Input
                        id="interests"
                        value={formData.interests}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            interests: e.target.value,
                          })
                        }
                        placeholder="e.g., Web Development, AI, Design"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 mt-1">
                        {user?.interests || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    {editing ? (
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 mt-1">
                        {user?.bio || "No bio provided"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                My Courses ({enrollments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No courses enrolled yet
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment._id}
                      className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">
                            {enrollment.course?.title || 'Course Title Not Available'}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {enrollment.totalLessons || 0} lessons
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Enrolled:{" "}
                              {new Date(
                                enrollment.enrolledAt || enrollment.createdAt
                              ).toLocaleDateString()}
                            </span>
                            {enrollment.course?.instructor?.name && (
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {enrollment.course.instructor.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            calculateProgress(enrollment) >= 100
                              ? "default"
                              : "secondary"
                          }
                        >
                          {calculateProgress(enrollment) >= 100
                            ? "Completed"
                            : "In Progress"}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Progress</span>
                          <span>{calculateProgress(enrollment)}%</span>
                        </div>
                        <Progress 
                          value={calculateProgress(enrollment)} 
                          className="w-full h-2"
                        />

                        <div className="text-sm text-gray-600">
                          {enrollment.completedLessons !== undefined && enrollment.totalLessons !== undefined ? (
                            <>
                              {enrollment.completedLessons} of{" "}
                              {enrollment.totalLessons} lessons completed
                            </>
                          ) : (
                            <span className="text-gray-500 italic">
                              Progress data loading...
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-3 mt-6">
                        <Button size="sm" asChild>
                          <Link href={`/courses/${enrollment.course?._id}/learn`}>
                            {calculateProgress(enrollment) >= 100
                              ? "Review Course"
                              : "Continue Learning"}
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/courses/${enrollment.course?._id}`}>
                            View Details
                          </Link>
                        </Button>
                        {calculateProgress(enrollment) >= 100 && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/certificates?courseId=${enrollment.course?._id}`}>
                              View Certificate
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Certificates ({certificates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No certificates earned yet
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Complete courses to earn certificates
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certificates.map((certificate) => (
                    <div
                      key={certificate._id}
                      className="border rounded-lg p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <Trophy className="h-10 w-10 text-yellow-600" />
                        <Badge variant="outline" className="bg-white/50">
                          Verified
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-lg mb-2">
                        {certificate.course?.title}
                      </h3>

                      <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Issued:{" "}
                          {new Date(certificate.issuedAt).toLocaleDateString()}
                        </p>
                        {certificate.finalScore && (
                          <p className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Final Score: {certificate.finalScore}%
                          </p>
                        )}
                        <p className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          Certificate ID: {certificate.certificateId}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownloadCertificate(certificate._id)
                          }
                          className="bg-white/50 hover:bg-white/70"
                        >
                          Download PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="bg-white/50 hover:bg-white/70"
                        >
                          <a
                            href={`/certificates/verify/${certificate._id}`}
                            target="_blank"
                          >
                            Verify
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Learning Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {enrollments.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Courses Enrolled
                  </div>
                </div>

                <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {(() => {
                      const totalLessons = enrollments.reduce((total, enrollment) => {
                        console.log("Enrollment for total lessons:", enrollment.course?.title, "totalLessons:", enrollment.totalLessons);
                        return total + (enrollment.totalLessons || 0);
                      }, 0);
                      console.log("Final total lessons:", totalLessons);
                      return totalLessons;
                    })()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Lessons
                  </div>
                </div>

                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {enrollments.filter((e) => calculateProgress(e) >= 100).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Courses Completed
                  </div>
                </div>

                <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    {certificates.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Certificates Earned
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Recent Activity
                  </h3>
                  {enrollments.length > 0 ? (
                    <div className="space-y-4">
                      {enrollments.slice(0, 5).map((enrollment) => (
                        <div
                          key={enrollment._id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">
                                {enrollment.course?.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {calculateProgress(enrollment) >= 100
                                  ? "Completed"
                                  : `${calculateProgress(
                                      enrollment
                                    )}% progress`}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(
                              enrollment.enrolledAt || enrollment.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No learning activity yet
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Enroll in courses to start your learning journey
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
