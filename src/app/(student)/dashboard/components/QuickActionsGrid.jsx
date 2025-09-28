import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  BookOpen,
  Award,
  HelpCircle,
  Settings,
  Users,
  BarChart3
} from 'lucide-react';

const quickActions = [
  {
    title: 'Browse Courses',
    description: 'Discover new courses to enhance your skills',
    icon: BookOpen,
    href: '/courses',
    color: 'bg-blue-500'
  },
  {
    title: 'My Certificates',
    description: 'View and download your course certificates',
    icon: Award,
    href: '/certificates',
    color: 'bg-yellow-500'
  },
  {
    title: 'Take Quiz',
    description: 'Test your knowledge with interactive quizzes',
    icon: BarChart3,
    href: '/quizzes',
    color: 'bg-green-500'
  },
  {
    title: 'Profile Settings',
    description: 'Update your profile and preferences',
    icon: Settings,
    href: '/profile',
    color: 'bg-purple-500'
  },
  {
    title: 'Help Center',
    description: 'Get help and support when you need it',
    icon: HelpCircle,
    href: '/help',
    color: 'bg-red-500'
  },
  {
    title: 'Community',
    description: 'Connect with other learners and instructors',
    icon: Users,
    href: '/community',
    color: 'bg-indigo-500'
  }
];

export default function QuickActionsGrid() {
  return (
    <div className="h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 scroll-smooth">
      <div className="space-y-3 pr-2">
        {quickActions.map((action, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary group">
            <CardContent className="p-3">
              <Link href={action.href} className="flex items-center space-x-3">
                <div className={`${action.color} p-2 rounded-lg text-white group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary transition-colors duration-200">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {action.description}
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}