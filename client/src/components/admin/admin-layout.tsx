import { AdminNav } from "./admin-nav";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <AdminNav />
            </nav>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:pl-14">
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
      
      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <AdminNav />
      </div>
    </div>
  );
}
