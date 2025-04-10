"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Trim email to avoid validation issues
    const trimmedEmail = email.trim();

    // Create user in Supabase Auth
    const { error: authError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    // Get the newly created user's ID
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(userError?.message || "Failed to retrieve user information.");
      return;
    }

    // Insert user details into the profiles table
    const { error: dbError } = await supabase.from("agents").insert([
      {
        user_id: user.id, // Use the retrieved user ID
        name,
        email: trimmedEmail,
        super_agent: null,
      },
    ]);

    if (dbError) {
      setError(dbError.message);
    } else {
      setSuccess("Account created successfully! You can now log in.");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-black text-white">
      <div className="w-full max-w-sm">
        <Card className="bg-black text-white">
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-gray-700 text-white"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-700 text-white"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-700 text-white"
                  />
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                {success && (
                  <div className="text-green-500 text-sm">{success}</div>
                )}
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full">
                    Sign Up
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}