"use client";

import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
  } from '@clerk/nextjs'
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Appbar() {
    const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return  <div className="flex justify-between items-center p-4">
        <div>DPin Uptime</div> 
        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
            >
                {mounted && resolvedTheme === "dark" ? (
                    <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                    <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                )}
            </button>
            {clerkEnabled ? (
                <>
                    <SignedOut>
                        <SignInButton />
                        <SignUpButton />
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </>
            ) : (
                <span className="text-sm text-gray-500">Auth not configured</span>
            )}
        </div>
    </div>
}
