"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  AlertCircle,
  RefreshCw,
  Download,
} from "lucide-react";
import { toast } from "react-hot-toast";

const CertificateSection = ({
  isPreviewMode,
  enrollment,
  completedLessons,
  lessons,
  certificateStatus,
  isGeneratingCertificate,
  handleGenerateCertificate,
  showCertificateModal,
  setShowCertificateModal,
}) => {
  if (isPreviewMode || !enrollment || completedLessons.size === 0) {
    return null;
  }

  const completionPercentage = lessons.length > 0 
    ? Math.round((completedLessons.size / lessons.length) * 100) 
    : 0;

  const canGenerateCertificate = completionPercentage >= 80;

  const handleDownloadCertificate = () => {
    if (certificateStatus?.certificate?._id) {
      const downloadUrl = `/api/certificates/${certificateStatus.certificate._id}/download`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `certificate-${certificateStatus.certificate.certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Certificate download started!');
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide">
        Certificate
      </h4>
      <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
        certificateStatus?.success
          ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800"
          : canGenerateCertificate
          ? "bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800 hover:shadow-lg"
          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      }`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {certificateStatus?.success ? (
              <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            ) : canGenerateCertificate ? (
              <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                Course Certificate
              </h5>
              {certificateStatus?.success && (
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  Earned
                </Badge>
              )}
            </div>
            
            {certificateStatus?.success ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  🎉 Congratulations! You've successfully completed this course.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    onClick={handleDownloadCertificate}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCertificateModal(true)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ) : canGenerateCertificate ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You're eligible for a certificate! Complete the course to generate your certificate.
                </p>
                <Button
                  size="sm"
                  onClick={() => handleGenerateCertificate(true)}
                  disabled={isGeneratingCertificate}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white w-full sm:w-auto"
                >
                  {isGeneratingCertificate ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Generate Certificate
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete {Math.ceil(lessons.length * 0.8)} lessons to earn your certificate.
                </p>
                <div className="text-xs text-gray-500">
                  Progress: {completedLessons.size}/{lessons.length} lessons ({completionPercentage}%)
                </div>
              </div>
            )}
            
            {certificateStatus && !certificateStatus.success && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {certificateStatus.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateSection;