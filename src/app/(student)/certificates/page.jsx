'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Award, 
  Download, 
  ExternalLink, 
  Calendar, 
  BookOpen,
  Trophy,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export default function CertificatesPage() {
  const { data: session, status } = useSession();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCertificates();
    }
  }, [status]);

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/certificates');
      if (response.ok) {
        const data = await response.json();
        setCertificates(data.data);
      } else {
        toast.error('Failed to fetch certificates');
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificateId, courseName, studentName) => {
    try {
      setDownloading(prev => ({ ...prev, [certificateId]: true }));
      
      const response = await fetch(`/api/certificates/${certificateId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Safely handle undefined values and create filename
        const safeCourseName = courseName || 'course';
        const safeStudentName = studentName || 'student';
        const safeCourseNameFormatted = safeCourseName.replace(/\s+/g, '-');
        const safeStudentNameFormatted = safeStudentName.replace(/\s+/g, '-');
        
        a.download = `certificate-${safeStudentNameFormatted}-${safeCourseNameFormatted}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Certificate downloaded successfully!');
      } else {
        toast.error('Failed to download certificate');
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    } finally {
      setDownloading(prev => ({ ...prev, [certificateId]: false }));
    }
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Certificates
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          View and download your course completion certificates
        </p>
      </div>

      {/* Search and Stats */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            <Trophy className="h-4 w-4 mr-1" />
            {certificates.length} Certificates
          </Badge>
        </div>
      </div>

      {/* Empty State */}
      {certificates.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Award className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Certificates Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Complete courses to earn certificates that you can download and share with employers.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Certificates Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
            <Card key={certificate._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    Certificate
                  </Badge>
                  <div className="text-xs text-gray-500">
                    {new Date(certificate.issuedAt).toLocaleDateString()}
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {certificate.course.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  Completed {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </CardHeader>

              <CardContent>
                {/* Certificate Preview */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 mb-4 border-2 border-blue-200 dark:border-blue-800">
                  <div className="text-center">
                    <Award className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      CERTIFICATE OF COMPLETION
                    </div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                      {session?.user?.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {certificate.course.title}
                    </div>
                    <div className="mt-2 text-xs text-blue-600 font-mono">
                      ID: {certificate.certificateId || certificate._id.substring(0, 12).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={() => downloadCertificate(
                      certificate._id, 
                      certificate.course?.title || 'Certificate', 
                      certificate.user?.name || session?.user?.name || 'Student'
                    )}
                    disabled={downloading[certificate._id]}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {downloading[certificate._id] ? 'Downloading...' : 'Download PDF'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const verifyUrl = `${window.location.origin}/certificates/verify/${certificate.certificateId || certificate._id}`;
                      navigator.clipboard.writeText(verifyUrl);
                      toast.success('Verification link copied to clipboard!');
                    }}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Copy Verification Link
                  </Button>
                </div>

                {/* Certificate Stats */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Completion Rate:</span>
                    <span>{certificate.completionPercentage || 100}%</span>
                  </div>
                  {certificate.finalScore && (
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span>Final Score:</span>
                      <span>{certificate.finalScore}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Search Results */}
      {filteredCertificates.length === 0 && certificates.length > 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No certificates found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
