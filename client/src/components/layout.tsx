import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

import logoUrl from "@assets/ATLOGOPNGNOBG_1768370491022.png";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800 bg-slate-900/50">
        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center p-2 border border-slate-200 shadow-sm">
          <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-lg tracking-tight text-white leading-none">Invoice-Gen</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Business Portal</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-6">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div 
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-white' : 'group-hover:text-primary'}`} />
                <span className="text-sm font-medium">{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 bg-slate-950/50 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-900/50 border border-slate-800">
          <Avatar className="h-9 w-9 border-2 border-slate-700">
            <AvatarFallback className="bg-slate-800 text-slate-200 text-xs">
              {user?.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{user?.role}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => logout()} 
            className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0 fixed inset-y-0 z-50">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center px-4 justify-between no-print">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Invoice-Gen Logo" className="h-8 w-auto object-contain" />
          <span className="font-display font-bold text-lg">Invoice-Gen</span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="no-print">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r border-border">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <div className="h-16 md:hidden"></div> {/* Spacer for mobile header */}
        <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
