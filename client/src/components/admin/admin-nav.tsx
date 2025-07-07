import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, CreditCard, Home } from "lucide-react";

const navItems = [
  {
    name: "İçerik Yönetimi",
    href: "/admin",
    icon: FileText,
  },
  {
    name: "Finans Tablosu",
    href: "/admin/finance",
    icon: CreditCard,
  },
];

export function AdminNav() {
  const [location] = useLocation();
  
  return (
    <nav className="grid items-start gap-2">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground mb-4"
      >
        <Home className="h-4 w-4" />
        <span>Siteye Dön</span>
      </Link>
      
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            location.startsWith(item.href) && "bg-muted text-primary"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  );
}

export function AdminMobileNav() {
  const [location] = useLocation();
  
  return (
    <div className="flex items-center justify-around border-t bg-background p-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center gap-1 rounded-lg p-2 text-xs text-muted-foreground transition-colors hover:text-primary",
            location.startsWith(item.href) && "text-primary"
          )}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.name}</span>
        </Link>
      ))}
    </div>
  );
}
