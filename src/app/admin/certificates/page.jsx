'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Award, 
  Download, 
  ExternalLink, 
  MoreHorizontal,
  Search,
  Filter,
  Calendar,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    valid: 0,
    revoked: 0
  });
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchCertificates();
    fetchStats();
  }, [currentPage, searchTerm]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/certificates?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCertificates(data.data);
        setTotalPages(data.pagination.totalPages);
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

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/certificates/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const downloadCertificate = async (certificateId, courseName, studentName) => {
    try {
      setActionLoading(prev => ({ ...prev, [`download-${certificateId}`]: true }));
      
      const response = await fetch(`/api/certificates/${certificateId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${studentName.replace(/\s+/g, '-')}-${courseName.replace(/\s+/g, '-')}.pdf`;
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
      setActionLoading(prev => ({ ...prev, [`download-${certificateId}`]: false }));
    }
  };

  const revokeCertificate = async (certificateId) => {
    if (!confirm('Are you sure you want to revoke this certificate? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [`revoke-${certificateId}`]: true }));
      
      const response = await fetch(`/api/admin/certificates/${certificateId}/revoke`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        toast.success('Certificate revoked successfully');
        fetchCertificates();
        fetchStats();
      } else {
        toast.error('Failed to revoke certificate');
      }
    } catch (error) {
      console.error('Error revoking certificate:', error);
      toast.error('Failed to revoke certificate');
    } finally {
      setActionLoading(prev => ({ ...prev, [`revoke-${certificateId}`]: false }));
    }
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Certificate Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and monitor course completion certificates
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Certificates
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  This Month
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.thisMonth}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Valid
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.valid}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Revoked
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.revoked}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by student name, course, or certificate ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Certificates ({filteredCertificates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Certificate ID</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.map((certificate) => (
                  <TableRow key={certificate._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{certificate.user.name}</p>
                        <p className="text-sm text-gray-500">{certificate.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{certificate.course.title}</p>
                        <p className="text-sm text-gray-500">
                          {certificate.completionPercentage}% completed
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {certificate.certificateId || certificate._id.substring(0, 12).toUpperCase()}
                      </code>
                    </TableCell>
                    <TableCell>
                      {new Date(certificate.issuedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={certificate.isValid ? "default" : "destructive"}
                      >
                        {certificate.isValid ? "Valid" : "Revoked"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {certificate.finalScore ? `${certificate.finalScore}%` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => downloadCertificate(
                              certificate._id,
                              certificate.course.title,
                              certificate.user.name
                            )}
                            disabled={actionLoading[`download-${certificate._id}`]}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const verifyUrl = `${window.location.origin}/certificates/verify/${certificate.certificateId || certificate._id}`;
                              navigator.clipboard.writeText(verifyUrl);
                              toast.success('Verification link copied!');
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Copy Verify Link
                          </DropdownMenuItem>
                          {certificate.isValid && (
                            <DropdownMenuItem
                              onClick={() => revokeCertificate(certificate._id)}
                              disabled={actionLoading[`revoke-${certificate._id}`]}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Revoke Certificate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredCertificates.length === 0 && (
            <div className="text-center py-12">
              <Award className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No certificates found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search terms' : 'No certificates have been issued yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
