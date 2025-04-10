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
  LucideChevronRight
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
      }
    ];

    return userRole === "agent"
      ? [...baseItems, ...agentOnlyItems]
      : [...baseItems];
  };

  const navItems = getNavItems();
  const userInitials = userRole === "agent" ? "AG" : "SA";
  const userName = userRole === "agent" ? "Agent" : "Sub-Agent";

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white text-sidebar-foreground">
      {/* Header with user info */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="" alt={userName} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold truncate">{userName}</span>
            <span className="text-xs text-muted-foreground">
              {userRole === "agent" ? "Administrator" : "Limited access"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <ScrollArea className="flex-1 py-4 bg-white">
        <nav className="flex flex-col px-3 space-y-1">
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
                        "flex items-center justify-between h-10 px-3 py-2 text-sm rounded-md",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} />
                        <span>{item.name}</span>
                      </div>

                      {isActive && (
                        <LucideChevronRight size={14} className="ml-auto" />
                      )}
                    </Link>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer with sign out button */}
      <div className="p-3 border-t mt-auto bg-white text-black">
        <Separator className="mt-2" />
        <Button
          variant="destructive"
          className="w-full hover:cursor-pointer text-black"
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
            <Button variant="outline" size="icon" className="bg-white">
              <LucideMenu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-white">
            {/* Add SheetTitle for accessibility */}
            <SheetTitle>
              <VisuallyHidden>Navigation Menu</VisuallyHidden>
            </SheetTitle>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar - hidden on mobile */}
      <aside className="hidden lg:flex w-64 border-r h-screen flex-col bg-white text-sidebar-foreground">
        {sidebarContent}
      </aside>
    </>
  );
}