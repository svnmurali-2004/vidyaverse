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
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
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
    title: "User Management",
    url: "/admin/users",
    icon: IconUsers,
    items: [
      {
        title: "All Users",
        url: "/admin/users",
      },
      {
        title: "Roles & Permissions",
        url: "/admin/users/roles",
      },
      {
        title: "User Analytics",
        url: "/admin/users/analytics",
      },
    ],
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
        title: "Categories",
        url: "/admin/courses/categories",
      },
      {
        title: "Instructors",
        url: "/admin/courses/instructors",
      },
      {
        title: "Course Analytics",
        url: "/admin/courses/analytics",
      },
    ],
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: IconChartBar,
    items: [
      {
        title: "Platform Overview",
        url: "/admin/analytics",
      },
      {
        title: "Revenue Reports",
        url: "/admin/analytics/revenue",
      },
      {
        title: "User Engagement",
        url: "/admin/analytics/engagement",
      },
    ],
  },
  {
    title: "Content Management",
    url: "/admin/content",
    icon: IconGlobe,
    items: [
      {
        title: "Pages",
        url: "/admin/content/pages",
      },
      {
        title: "Blog Posts",
        url: "/admin/content/blog",
      },
      {
        title: "Media Library",
        url: "/admin/content/media",
      },
    ],
  },
  {
    title: "Notifications",
    url: "/admin/notifications",
    icon: IconBell,
    items: [
      {
        title: "Send Notifications",
        url: "/admin/notifications/send",
      },
      {
        title: "Email Templates",
        url: "/admin/notifications/templates",
      },
      {
        title: "Notification History",
        url: "/admin/notifications/history",
      },
    ],
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: IconSettings,
    items: [
      {
        title: "General Settings",
        url: "/admin/settings/general",
      },
      {
        title: "Payment Settings",
        url: "/admin/settings/payments",
      },
      {
        title: "Email Settings",
        url: "/admin/settings/email",
      },
      {
        title: "Security",
        url: "/admin/settings/security",
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
