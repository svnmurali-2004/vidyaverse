'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Download, 
  Apple, 
  Play,
  X,
  Monitor
} from 'lucide-react';

export default function AppDownloadBanner({ variant = 'floating', onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      setIsVisible(false);
    }

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      setIsVisible(false);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handlePWAInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsVisible(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
    if (onClose) onClose();
  };

  if (!isVisible || isInstalled) return null;

  if (variant === 'navbar') {
    return (
      <div className="flex items-center space-x-2">
        <Smartphone className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium">Get our app</span>
        <div className="flex space-x-1">
          {isInstallable && (
            <Button onClick={handlePWAInstall} size="sm" variant="ghost" className="h-6 px-2">
              <Monitor className="h-3 w-3" />
            </Button>
          )}
          <Button asChild size="sm" variant="ghost" className="h-6 px-2">
            <Link href="#">
              <Apple className="h-3 w-3" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="h-6 px-2">
            <Link href="#">
              <Play className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border shadow-lg rounded-lg p-4 max-w-sm">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Get Our Mobile App
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Learn on the go
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex space-x-2">
          {isInstallable && (
            <Button onClick={handlePWAInstall} size="sm" className="flex-1 h-8">
              <Monitor className="h-3 w-3 mr-1" />
              <span className="text-xs">Install</span>
            </Button>
          )}
          <Button asChild size="sm" className="flex-1 h-8">
            <Link href="#" className="flex items-center justify-center space-x-1">
              <Apple className="h-3 w-3" />
              <span className="text-xs">iOS</span>
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="flex-1 h-8">
            <Link href="#" className="flex items-center justify-center space-x-1">
              <Play className="h-3 w-3" />
              <span className="text-xs">Android</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Top banner variant
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">
                📱 Download our mobile app for the best learning experience
              </span>
            </div>
            <div className="hidden sm:flex space-x-2">
              {isInstallable && (
                <Button onClick={handlePWAInstall} size="sm" variant="secondary" className="h-7">
                  <Monitor className="h-3 w-3 mr-1" />
                  <span className="text-xs">Install App</span>
                </Button>
              )}
              <Button asChild size="sm" variant="secondary" className="h-7">
                <Link href="#" className="flex items-center space-x-1">
                  <Apple className="h-3 w-3" />
                  <span className="text-xs">App Store</span>
                </Link>
              </Button>
              <Button asChild size="sm" variant="secondary" className="h-7">
                <Link href="#" className="flex items-center space-x-1">
                  <Play className="h-3 w-3" />
                  <span className="text-xs">Google Play</span>
                </Link>
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
