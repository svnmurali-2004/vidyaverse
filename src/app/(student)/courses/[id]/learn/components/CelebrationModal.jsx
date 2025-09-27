"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Award, Download, X } from "lucide-react";

const CelebrationModal = ({ 
  showCelebration, 
  showCertificateModal, 
  setShowCertificateModal, 
  certificateStatus 
}) => {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (showCelebration) {
      // Create confetti effect
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        color: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 6)],
      }));
      setConfetti(newConfetti);

      // Clear confetti after animation
      setTimeout(() => setConfetti([]), 4000);
    }
  }, [showCelebration]);

  const handleDownloadCertificate = () => {
    if (certificateStatus?.certificate?._id) {
      const downloadUrl = `/api/certificates/${certificateStatus.certificate._id}/download`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `certificate-${certificateStatus.certificate.certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!showCertificateModal) {
    return null;
  }

  return (
    <>
      {/* Celebration Effect */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confetti.map((piece) => (
            <div
              key={piece.id}
              className="absolute w-3 h-3 animate-bounce"
              style={{
                left: `${piece.x}%`,
                top: `${piece.y}%`,
                backgroundColor: piece.color,
                transform: `rotate(${piece.rotation}deg)`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Certificate Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCertificateModal(false)}
            className="absolute top-4 right-4"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <div className="mb-6">
              <Award className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                🎉 Congratulations!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                You have successfully completed the course and earned your certificate!
              </p>
            </div>

            {certificateStatus?.certificate && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Certificate ID: {certificateStatus.certificate.certificateId}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Completion: {certificateStatus.certificate.completionPercentage}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Issued: {new Date(certificateStatus.certificate.issuedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleDownloadCertificate}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowCertificateModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CelebrationModal;