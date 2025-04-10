"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login"); // Redirect to login if not authenticated
      } else {
        setLoading(false); // User is authenticated
      }
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // Redirect to login after signing out
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while checking auth
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-lg font-bold mb-4">Sidebar</h2>
        <ul className="space-y-2">
          <li>
            <a href="/dashboard" className="hover:underline">
              Dashboard
            </a>
          </li>
          {/* Add more sidebar links here */}
        </ul>
        <Button
          onClick={handleSignOut}
          className="mt-4 w-full bg-red-500 hover:bg-red-600"
        >
          Sign Out
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome to your dashboard!</p>
      </main>
    </div>
  );
}