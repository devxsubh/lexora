'use client'

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Scale } from "lucide-react";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const isSignIn = pathname === '/signin';
  
  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="grid min-h-dvh justify-center p-2 lg:grid-cols-2">
        {/* Left Panel - Form */}
        <div className="relative order-1 flex h-full items-center justify-center">
          {children}
        </div>
        
        {/* Right Panel - Branding with dark-to-orange gradient */}
        <div className="relative order-2 hidden h-full rounded-3xl lg:flex flex-col overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at bottom right, #ea580c 0%, #c2410c 25%, #1a1a1a 60%, #0a0a0a 100%)'
          }}
        >
          {/* Top Section - Logo & Name */}
          <div className="text-white absolute top-10 space-y-2 px-10 z-10">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Lexora</h1>
            <p className="text-sm text-white/70">AI-Powered Contract Intelligence</p>
          </div>

          {/* Bottom Section - Info Cards */}
          <div className="absolute bottom-10 flex w-full gap-4 px-10 z-10">
            <div className="text-white flex-1 space-y-2 pr-6 border-r border-white/20">
              <h2 className="font-medium">Draft smarter contracts</h2>
              <p className="text-sm text-white/70">
                Generate, review, and analyze legal documents with AI assistance in seconds.
              </p>
            </div>
            <div className="text-white flex-1 space-y-2 pl-2">
              <h2 className="font-medium">Enterprise ready</h2>
              <p className="text-sm text-white/70">
                Bank-grade security, team collaboration, and compliance built right in.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Right - Auth Switch Link (positioned on right side of left panel) */}
      <div className="absolute top-5 right-5 lg:right-[calc(50%+1rem)] flex items-center">
        <div className="text-sm text-gray-600">
          {isSignIn ? (
            <>
              Don&apos;t have an account?{" "}
              <Link className="text-gray-900 font-medium hover:underline" href="/signup">
                Register
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link className="text-gray-900 font-medium hover:underline" href="/signin">
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Bottom Left - Copyright */}
      <div className="absolute bottom-5 left-5 hidden lg:block">
        <div className="text-sm text-gray-500">© 2025, Lexora Inc.</div>
      </div>

      {/* Bottom Right - Language (on left panel side) */}
      <div className="absolute bottom-5 right-5 lg:right-[calc(50%+1rem)]">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Globe className="size-4" />
          ENG
        </div>
      </div>
    </main>
  );
}

