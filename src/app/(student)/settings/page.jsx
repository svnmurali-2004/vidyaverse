'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { 
  Settings, 
  Bell, 
  Shield, 
  Trash2, 
  Key,
  Mail,
  Smartphone,
  AlertTriangle
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [notifications, setNotifications] = useState({
    emailDigest: true,
    courseUpdates: true,
    newLessons: true,
    certificates: true,
    promotions: false,
    reminders: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showProgress: true,
    showCertificates: true,
    allowMessages: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    if (session?.user) {
      fetchSettings();
    }
  }, [session, status]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/users/${session.user.id}/settings`);
      if (response.ok) {
        const data = await response.json();
        if (data.notifications) setNotifications(data.notifications);
        if (data.privacy) setPrivacy(data.privacy);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/users/${session.user.id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notifications }),
      });

      if (response.ok) {
        toast.success('Notification preferences updated');
      } else {
        toast.error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const savePrivacySettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/users/${session.user.id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ privacy }),
      });

      if (response.ok) {
        toast.success('Privacy settings updated');
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating privacy:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/users/${session.user.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Account deleted successfully');
        router.push('/');
      } else {
        toast.error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Settings className="h-8 w-8 mr-3" />
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account preferences and privacy settings
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose what notifications you want to receive
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label>Email Digest</Label>
                      <p className="text-sm text-gray-500">Weekly summary of your learning progress</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.emailDigest}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailDigest: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label>Course Updates</Label>
                      <p className="text-sm text-gray-500">New content added to your enrolled courses</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.courseUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, courseUpdates: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label>New Lessons</Label>
                      <p className="text-sm text-gray-500">Notifications when new lessons are available</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.newLessons}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, newLessons: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label>Certificates</Label>
                      <p className="text-sm text-gray-500">When you earn a new certificate</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.certificates}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, certificates: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label>Promotions</Label>
                      <p className="text-sm text-gray-500">Special offers and new course announcements</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.promotions}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, promotions: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label>Learning Reminders</Label>
                      <p className="text-sm text-gray-500">Gentle reminders to continue your learning</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.reminders}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, reminders: checked })
                    }
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={saveNotificationSettings} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy Settings
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Control who can see your profile and activity
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Learning Progress</Label>
                    <p className="text-sm text-gray-500">Allow others to see your course progress</p>
                  </div>
                  <Switch
                    checked={privacy.showProgress}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, showProgress: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Certificates</Label>
                    <p className="text-sm text-gray-500">Display your earned certificates publicly</p>
                  </div>
                  <Switch
                    checked={privacy.showCertificates}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, showCertificates: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Messages</Label>
                    <p className="text-sm text-gray-500">Let other students and instructors message you</p>
                  </div>
                  <Switch
                    checked={privacy.allowMessages}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, allowMessages: checked })
                    }
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={savePrivacySettings} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Privacy Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Change Password
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Update your password to keep your account secure
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                  />
                </div>

                <Button onClick={changePassword} disabled={saving}>
                  {saving ? 'Changing...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Danger Zone
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Irreversible and destructive actions
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-red-600 dark:text-red-400">Delete Account</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={deleteAccount}
                      disabled={saving}
                      className="flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {saving ? 'Deleting...' : 'Delete My Account'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
