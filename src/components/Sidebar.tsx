"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LucideHome,
  LucideUsers,
  LucideFolderOpen,
  LucideLogOut,
  LucideUserPlus,
  LucideMenu,
  LucideX,
  LucideChevronRight,
  LucideUniversity
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  onSignOut: () => Promise<void>;
  userRole: "agent" | "sub-agent" | null;
}

export function Sidebar({ onSignOut, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LucideHome
      },
      {
        name: "Applications",
        href: "/dashboard/applications",
        icon: LucideFolderOpen,
        badge: "New"
      }
    ];

    // Items only for agents (not sub-agents)
    const agentOnlyItems = [
      {
        name: "Students",
        href: "/dashboard/students",
        icon: LucideUsers
      },
      {
        name: "Sub-Agents",
        href: "/dashboard/sub-agents",
        icon: LucideUserPlus
      },
      {
        name: "Colleges",
        href: "/dashboard/colleges",
        icon: LucideUniversity
      }
    ];

    return userRole === "agent" ? [...baseItems, ...agentOnlyItems] : [...baseItems];
  };

  const navItems = getNavItems();
  const userInitials = "JD"; // Replace with actual user initials
  const userName = "John Doe"; // Replace with actual user name

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white">
      {/* Header with user info */}
      <div className="p-6 border-b bg-gradient-to-r from-teal-500 to-cyan-600">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarImage src="" alt={userName} />
            <AvatarFallback className="bg-white/90 text-teal-800 font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white truncate">
              {userName}
            </span>
            <span className="text-xs text-teal-50">
              {userRole === "agent" ? "Administrator" : "Limited access"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <ScrollArea className="flex-1 py-6 px-4">
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <TooltipProvider key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between h-10 px-3 py-2 text-sm rounded-lg transition-all duration-200",
                        "hover:bg-teal-50 hover:text-teal-700",
                        isActive
                          ? "bg-teal-50 text-teal-700 font-medium shadow-sm"
                          : "text-gray-600"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={isActive ? "text-teal-600" : "text-gray-500"} />
                        <span>{item.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        
                        {isActive && (
                          <LucideChevronRight size={16} className="text-teal-600" />
                        )}
                      </div>
                    </Link>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer with sign out button */}
      <div className="p-4 border-t mt-auto">
        <Button
          variant="outline"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={onSignOut}
        >
          <LucideLogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger menu */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white shadow-md">
              <LucideMenu className="text-gray-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SheetTitle>
              <VisuallyHidden>Navigation Menu</VisuallyHidden>
            </SheetTitle>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar - hidden on mobile */}
      <aside className="hidden lg:flex w-72 border-r h-screen flex-col bg-white">
        {sidebarContent}
      </aside>
    </>
  );
}
