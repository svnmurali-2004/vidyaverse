'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Download, 
  Apple, 
  Play,
  Star,
  Users,
  Shield,
  Zap,
  BookOpen,
  Trophy,
  Clock,
  Wifi,
  CheckCircle,
  ArrowRight,
  Monitor
} from 'lucide-react';

export default function AppDownload() {
  const [downloadCount, setDownloadCount] = useState('10K+');
  const [rating, setRating] = useState(4.8);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
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
    }
  };

  const appFeatures = [
    {
      icon: BookOpen,
      title: 'Offline Learning',
      description: 'Download courses and learn anywhere, anytime without internet'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for mobile with smooth performance and quick loading'
    },
    {
      icon: Trophy,
      title: 'Achievement System',
      description: 'Earn badges, track progress, and compete with friends'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected with industry standards'
    },
    {
      icon: Clock,
      title: 'Smart Reminders',
      description: 'Never miss a lesson with intelligent study reminders'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join study groups and connect with learners worldwide'
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            📱 Now Available on Mobile
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Learn on the Go with Our Mobile App
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Take your learning experience to the next level. Download our mobile app for seamless access to courses, offline learning, and exclusive mobile features.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - App Info */}
          <div className="space-y-8">
            {/* App Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{downloadCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  {renderStars(rating)}
                  <span className="text-lg font-bold text-gray-900 dark:text-white ml-2">
                    {rating}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">Free</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">No Cost</div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Download Now
              </h3>
              
              {/* PWA Install Button */}
              {isInstallable && !isInstalled && (
                <Button 
                  onClick={handlePWAInstall}
                  className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white mb-4"
                >
                  <div className="flex items-center space-x-3">
                    <Monitor className="h-6 w-6" />
                    <div className="text-left">
                      <div className="text-xs">Install as</div>
                      <div className="text-sm font-semibold">Web App (Recommended)</div>
                    </div>
                  </div>
                </Button>
              )}

              {isInstalled && (
                <div className="w-full h-14 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">App Installed!</span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* App Store Button */}
                <Button 
                  asChild 
                  className="flex-1 h-14 bg-black hover:bg-gray-800 text-white"
                >
                  <Link href="#" className="flex items-center space-x-3">
                    <Apple className="h-6 w-6" />
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </Link>
                </Button>

                {/* Google Play Button */}
                <Button 
                  asChild 
                  className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Link href="#" className="flex items-center space-x-3">
                    <Play className="h-6 w-6" />
                    <div className="text-left">
                      <div className="text-xs">Get it on</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </Link>
                </Button>
              </div>

              {/* QR Code Option */}
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
                    <span className="text-xs font-mono">QR</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Scan QR Code
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Point your camera here to download
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Why Choose Our App?
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Learn offline without internet connection
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Sync progress across all devices
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Push notifications for new content
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Enhanced mobile learning experience
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Features Grid */}
          <div className="space-y-6">
            {/* Phone Mockup or Features */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
                <div className="flex items-center space-x-3 mb-6">
                  <Smartphone className="h-8 w-8" />
                  <div>
                    <h3 className="text-xl font-bold">VidyaVerse Mobile</h3>
                    <p className="text-blue-100">Learning in your pocket</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Download className="h-5 w-5" />
                      <span className="font-medium">Download for Offline</span>
                    </div>
                    <p className="text-sm text-blue-100 mt-1">
                      Save courses to learn without internet
                    </p>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Wifi className="h-5 w-5" />
                      <span className="font-medium">Smart Sync</span>
                    </div>
                    <p className="text-sm text-blue-100 mt-1">
                      Automatic progress synchronization
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {appFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {feature.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-2">Ready to Learn Anywhere?</h3>
            <p className="text-blue-100 mb-6">
              Join thousands of learners who are already using our mobile app
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button 
                asChild 
                variant="secondary" 
                className="flex-1"
              >
                <Link href="#" className="flex items-center justify-center space-x-2">
                  <Apple className="h-5 w-5" />
                  <span>iOS App</span>
                </Link>
              </Button>
              <Button 
                asChild 
                variant="secondary" 
                className="flex-1"
              >
                <Link href="#" className="flex items-center justify-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>Android App</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
