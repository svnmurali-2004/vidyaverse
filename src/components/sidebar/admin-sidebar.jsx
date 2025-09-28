"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  IconDashboard,
  IconUsers,
  IconBook,
  IconChartBar,
  IconSettings,
  IconLogout,
  IconUser,
  IconBell,
  IconGlobe,
  IconClipboardCheck,
  IconFileText,
  IconTicket,
} from "@tabler/icons-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "lucide-react";

const adminNavigation = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: IconDashboard,
  },
  {
    title: "Course Management",
    url: "/admin/courses",
    icon: IconBook,
    items: [
      {
        title: "All Courses",
        url: "/admin/courses",
      },
      {
        title: "Create Course",
        url: "/admin/courses/create",
      },
      {
        title: "Course Analytics",
        url: "/admin/analytics",
      },
    ],
  },
  {
    title: "Quiz Management",
    url: "/admin/quizzes",
    icon: IconClipboardCheck,
    items: [
      {
        title: "All Quizzes",
        url: "/admin/quizzes",
      },
      {
        title: "Create Quiz",
        url: "/admin/quizzes/create",
      },
    ],
  },
  {
    title: "User Management",
    url: "/admin/users",
    icon: IconUsers,
    items: [
      {
        title: "All Users",
        url: "/admin/users",
      },
      {
        title: "User Analytics",
        url: "/admin/analytics",
      },
    ],
  },
  {
    title: "Coupon Management",
    url: "/admin/coupons",
    icon: IconTicket,
    items: [
      {
        title: "All Coupons",
        url: "/admin/coupons",
      },
      {
        title: "Create Coupon",
        url: "/admin/coupons?create=true",
      },
      {
        title: "Usage Analytics",
        url: "/admin/analytics/coupons",
      },
    ],
  },
  {
    title: "Analytics & Reports",
    url: "/admin/analytics",
    icon: IconChartBar,
    items: [
      {
        title: "Platform Overview",
        url: "/admin/analytics",
      },
      {
        title: "Course Performance",
        url: "/admin/analytics",
      },
      {
        title: "User Engagement",
        url: "/admin/analytics",
      },
      {
        title: "Revenue Reports",
        url: "/admin/analytics",
      },
    ],
  },
  {
    title: "Content Management",
    url: "/admin/content",
    icon: IconFileText,
    items: [
      {
        title: "Lessons",
        url: "/admin/courses",
      },
      {
        title: "Media Library",
        url: "/admin/content/media",
      },
      {
        title: "Categories",
        url: "/admin/courses/categories",
      },
    ],
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: IconSettings,
    items: [
      {
        title: "Platform Settings",
        url: "/admin/settings",
      },
      {
        title: "Payment Settings",
        url: "/admin/settings/payments",
      },
      {
        title: "User Permissions",
        url: "/admin/settings/permissions",
      },
    ],
  },
];

export function AdminSidebar({ ...props }) {
  const { data: session, status } = useSession();

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" disabled>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <IconDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">VidyaVerse</span>
                  <span className="truncate text-xs">Loading...</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 text-sm text-muted-foreground">Loading...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  const adminData = {
    user: {
      name: session?.user?.name || "Admin User",
      email: session?.user?.email || "admin@vidyaverse.com",
      avatar: session?.user?.avatar || "https://avatar.vercel.sh/ghfd",
      fallback: session?.user?.name
        ? session.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "AU",
    },
    navMain: adminNavigation,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <IconDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">VidyaVerse</span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={adminData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={adminData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
