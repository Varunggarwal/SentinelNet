"use client";

import {
    ClerkLoaded,
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
  } from '@clerk/nextjs'
import { Activity, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Appbar() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return  <div className="sticky top-0 z-40 border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/75">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-900/20">
                <Activity className="h-5 w-5" />
            </div>
            <div>
                <div className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">SentinelNet</div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Distributed Uptime</div>
            </div>
        </Link>
        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                aria-label="Toggle theme"
            >
                {mounted && resolvedTheme === "dark" ? (
                    <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                    <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                )}
            </button>
            <ClerkLoaded>
                <SignedOut>
                    <div className="flex items-center gap-2">
                        <SignInButton mode="modal">
                            <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800">
                                Sign in
                            </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400">
                                Create account
                            </button>
                        </SignUpButton>
                    </div>
                </SignedOut>
                <SignedIn>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                        >
                            Dashboard
                        </Link>
                        <UserButton />
                    </div>
                </SignedIn>
            </ClerkLoaded>
        </div>
        </div>
    </div>
}
