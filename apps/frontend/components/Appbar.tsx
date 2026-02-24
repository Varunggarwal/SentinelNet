"use client";

import { SignInButton, SignedIn, SignedOut, UserButton, SignUpButton} from "@clerk/nextjs";

export const Appbar = () => {
    return <div className="flex justify-between items-center p-4">
        <div>DPin-Uptime</div>
        <div>
        <SignedOut>
            <SignInButton />
            <SignUpButton>
                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                    Sign Up
                </button>
            </SignUpButton>
        </SignedOut>
              {/* Show the user button when the user is signed in */}
        <SignedIn>
            <UserButton />
        </SignedIn>
        </div>

    </div>
}