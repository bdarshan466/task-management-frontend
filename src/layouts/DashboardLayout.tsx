import type { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden text-foreground selection:bg-primary/20">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
