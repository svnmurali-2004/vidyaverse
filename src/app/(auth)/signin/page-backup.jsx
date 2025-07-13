"use client";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export function LoginForm({ className, ...props }) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials");
      } else {
        toast.success("Signed in successfully!");
        // Get session to check user role and redirect accordingly
        const session = await getSession();
        if (session?.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setIsLoading(true);

    try {
      const result = await signIn(provider, {
        redirect: false,
      });

      if (result?.ok) {
        toast.success("Signed in successfully!");
        // Get session to check user role and redirect accordingly
        const session = await getSession();
        if (session?.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else if (result?.error) {
        toast.error("Failed to sign in");
        setIsLoading(false);
      }
    } catch (err) {
      toast.error(`Failed to sign in with ${provider}`);
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your VidyaVerse account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignIn}>
            <div className="grid gap-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="ml-auto inline-block text-sm underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">VidyaVerse</h1>
            <p className="text-balance text-muted-foreground">
              Welcome back to your learning journey
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Learn Without Limits
            </h2>
            <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 mt-4">
              Access thousands of courses, quizzes, and learning materials
              designed to help you achieve your goals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
