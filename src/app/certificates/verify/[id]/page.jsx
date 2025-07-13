'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  BookOpen,
  Shield,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function CertificateVerificationPage() {
  const params = useParams();
  const certificateId = params.id;
  
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/certificates/verify/${certificateId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setCertificate(data.data);
      } else {
        setError(data.error || 'Certificate not found');
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setError('Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          
          <Card className="overflow-hidden">
            <CardHeader className="text-center pb-6">
              <Skeleton className="h-16 w-16 mx-auto rounded-full mb-4" />
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Certificate Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verify the authenticity of VidyaVerse course completion certificates
          </p>
        </div>

        {error ? (
          /* Error State */
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="text-center pb-6">
              <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
              <CardTitle className="text-red-700 dark:text-red-300">
                Certificate Not Found
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {error}
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <p className="font-medium mb-1">Possible reasons:</p>
                    <ul className="list-disc list-inside space-y-1 text-red-600 dark:text-red-400">
                      <li>Invalid certificate ID</li>
                      <li>Certificate has been revoked</li>
                      <li>Certificate ID was mistyped</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href="/">
                  Return to Homepage
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : certificate ? (
          /* Valid Certificate */
          <>
            <Card className="overflow-hidden border-green-200 dark:border-green-800 mb-6">
              <CardHeader className="text-center pb-6 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
                <CardTitle className="text-green-700 dark:text-green-300 flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5" />
                  Valid Certificate
                </CardTitle>
                <p className="text-green-600 dark:text-green-400">
                  This certificate has been verified as authentic
                </p>
              </CardHeader>
            </Card>

            {/* Certificate Details */}
            <Card className="overflow-hidden">
              <CardHeader className="text-center pb-6">
                <Award className="h-16 w-16 mx-auto text-blue-600 mb-4" />
                <CardTitle className="text-2xl text-gray-900 dark:text-white">
                  Certificate of Completion
                </CardTitle>
                <Badge variant="outline" className="text-sm">
                  ID: {certificate.certificateId}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Student Information */}
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Student Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Student Name
                      </label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {certificate.userName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Completion Date
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Course Information */}
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Course Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Course Title
                      </label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {certificate.courseName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Instructor
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {certificate.instructorName || 'VidyaVerse Team'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification Details */}
                <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Verification Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-blue-700 dark:text-blue-300">
                        Issued By
                      </label>
                      <p className="text-blue-900 dark:text-blue-100">
                        VidyaVerse Learning Platform
                      </p>
                    </div>
                    <div>
                      <label className="font-medium text-blue-700 dark:text-blue-300">
                        Verification Status
                      </label>
                      <p className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Verified & Valid
                      </p>
                    </div>
                    <div>
                      <label className="font-medium text-blue-700 dark:text-blue-300">
                        Certificate ID
                      </label>
                      <p className="text-blue-900 dark:text-blue-100 font-mono">
                        {certificate.certificateId}
                      </p>
                    </div>
                    <div>
                      <label className="font-medium text-blue-700 dark:text-blue-300">
                        Verified On
                      </label>
                      <p className="text-blue-900 dark:text-blue-100">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit VidyaVerse
                    </Link>
                  </Button>
                  <Button 
                    onClick={() => window.print()} 
                    variant="outline"
                    className="flex-1"
                  >
                    Print Verification
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Footer Note */}
            <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
              <p>
                This verification confirms that the certificate holder has successfully completed 
                the specified course on VidyaVerse learning platform.
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
