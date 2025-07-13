"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, X, Eye } from "lucide-react";

export default function PWADebug() {
  const [checks, setChecks] = useState({
    https: false,
    serviceWorker: false,
    manifest: false,
    installable: false,
    standalone: false,
  });
  const [isVisible, setIsVisible] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Set the current URL on client side
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }      const runChecks = async () => {
        // Only run checks on client side
        if (typeof window === 'undefined') return;
        
        const newChecks = { ...checks };

        // Check HTTPS
        newChecks.https = window.location.protocol === 'https:' || window.location.hostname === 'localhost';

      // Check Service Worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          newChecks.serviceWorker = !!registration;
          
          if (!registration) {
            console.log("No service worker registration found");
            // Try to check if SW file exists
            try {
              const swResponse = await fetch('/sw.js');
              console.log("Service worker file check:", swResponse.status, swResponse.ok);
            } catch (e) {
              console.log("Service worker file not found:", e);
            }
          } else {
            console.log("Service worker registration found:", registration);
          }
        } catch (error) {
          console.error('Service Worker check failed:', error);
          newChecks.serviceWorker = false;
        }
      } else {
        console.log("Service Workers not supported");
      }

      // Check Manifest
      try {
        const manifestResponse = await fetch('/manifest.json');
        newChecks.manifest = manifestResponse.ok;
        if (!manifestResponse.ok) {
          console.error("Manifest fetch failed:", manifestResponse.status);
        } else {
          const manifestData = await manifestResponse.json();
          console.log("Manifest data:", manifestData);
        }
      } catch (error) {
        console.error('Manifest check failed:', error);
        newChecks.manifest = false;
      }

      // Check if installable
      newChecks.installable = 'BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window;

      // Check if running in standalone mode
      newChecks.standalone = window.matchMedia('(display-mode: standalone)').matches;

      setChecks(newChecks);
    };

    runChecks();
  }, []);

  const getIcon = (status) => {
    if (status) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatus = (status) => {
    return status ? (
      <Badge variant="outline" className="text-green-600 border-green-200">
        ✓ Pass
      </Badge>
    ) : (
      <Badge variant="outline" className="text-red-600 border-red-200">
        ✗ Fail
      </Badge>
    );
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // If hidden, show a small toggle button
  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="bg-white dark:bg-gray-800 shadow-lg"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              PWA Debug Info
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getIcon(checks.https)}
              <span className="text-xs">HTTPS/Localhost</span>
            </div>
            {getStatus(checks.https)}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getIcon(checks.serviceWorker)}
              <span className="text-xs">Service Worker</span>
            </div>
            {getStatus(checks.serviceWorker)}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getIcon(checks.manifest)}
              <span className="text-xs">Manifest</span>
            </div>
            {getStatus(checks.manifest)}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getIcon(checks.installable)}
              <span className="text-xs">Installable</span>
            </div>
            {getStatus(checks.installable)}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getIcon(checks.standalone)}
              <span className="text-xs">Standalone Mode</span>
            </div>
            {getStatus(checks.standalone)}
          </div>
          
          <div className="pt-2 border-t text-xs text-gray-500">
            URL: {currentUrl || 'Loading...'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
