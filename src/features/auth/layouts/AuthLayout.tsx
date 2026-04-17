import React from 'react';
import { Layers } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Artistic Brand Pane (hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-primary relative overflow-hidden">
        {/* Subtle geometric background to feel like Enterprise software (Atlassian style) */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        ></div>

        <div className="relative z-10 flex items-center text-primary-foreground font-bold text-2xl gap-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <Layers className="text-white h-6 w-6" />
          </div>
          TaskOrbit
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-bold text-primary-foreground tracking-tight mb-4">
            Manage your entire project lifecycle seamlessly
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Built for modern teams to track tasks, log time, and orchestrate sprints with absolute
            clarity.
          </p>
        </div>
      </div>

      {/* Right Form Pane */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}
