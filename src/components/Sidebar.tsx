"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LucideHome,
  LucideFolderOpen,
  LucideLogOut,
  LucideUserPlus,
  LucideMenu,
  LucideChevronRight,
  LucideUniversity,
  HandCoins,
  Wallet,
  UserCheck
} from "lucide-react";
import { supabase } from "@/utils/supabase";
import { useCurrentUserData } from "@/hooks/useCurrentUserData";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
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
  userRole: "agent" | "sub-agent" | "counsellor" | null;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Use the hook to fetch user data
  const { user } = useCurrentUserData();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    // Base items for all users
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
      },
      {
        name: "Colleges",
        href: "/dashboard/colleges",
        icon: LucideUniversity
      },
    ];

    // Items for counsellors (only dashboard, applications, colleges)
    if (userRole === "counsellor") {
      return baseItems;
    }

    // Additional items for agents and subagents
    const agentSubagentItems = [
      {
        name: "Counsellors",
        href: "/dashboard/counsellors",
        icon: UserCheck
      },
      {
        name: "Wallet",
        href: "/dashboard/wallet",
        icon: Wallet
      },
      {
        name: "Commissions",
        href: "/dashboard/commissions",
        icon: HandCoins
      },
    ];

    // Items only for Partners (not associate partners or counsellors)
    const agentOnlyItems = [
      {
        name: "Associate Partners",
        href: "/dashboard/associate-partners",
        icon: LucideUserPlus
      },
    ];

    if (userRole === "agent") {
      return [...baseItems, ...agentSubagentItems, ...agentOnlyItems];
    } else if (userRole === "sub-agent") {
      return [...baseItems, ...agentSubagentItems];
    }

    return baseItems;
  };

  const navItems = getNavItems();
  // Get user initials from user name
  const getUserInitials = () => {
    if (!user?.name) return "NA";

    const nameParts = user.name.trim().split(/\s+/);
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();

    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  const userInitials = getUserInitials();
  const userName = user?.name || "Loading...";


  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-zinc-400 bg-[#EBF6FA] fixed w-72">
      {/* Header with user info */}
      <div className="p-2">
        <div className="flex items-center gap-3 bg-[#222B38] p-4 rounded-lg">
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
              {userRole === "agent" ? "Partner" : userRole === "sub-agent" ? "Associate Partner" : "Counsellor"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <ScrollArea className="flex-1 py-6 px-4">
        <nav className="flex flex-col space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between h-10 px-3 py-2 text-sm rounded-lg transition-all duration-200",
                        "hover:text-black",
                        isActive
                          ? "text-black font-medium bg-[#FFC11F]"
                          : "text-gray-600"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={isActive ? "text-black" : "text-gray-500"} />
                        <span>{item.name}</span>
                      </div>

                      <div className="flex items-center gap-2">

                        {isActive && (
                          <LucideChevronRight size={16} className="text-black" />
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
      <div className="p-4  mt-auto">
        <Button
          variant="outline"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={() => handleSignOut()}
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
      <aside className="hidden lg:flex w-72  h-screen flex-col bg-white">
        {sidebarContent}
      </aside>
    </>
  );
}

