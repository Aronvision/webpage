'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Calendar, Map, User, Settings, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const SidebarItem = ({ href, icon, label, active }: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
        active 
          ? 'bg-primary-100 text-primary-700 font-medium' 
          : 'text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export function Sidebar() {
  const pathname = usePathname();
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const navItems = [
    {
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
      label: '대시보드',
    },
    {
      href: '/reservations',
      icon: <Calendar className="h-5 w-5" />,
      label: '예약 관리',
    },
    {
      href: '/map',
      icon: <Map className="h-5 w-5" />,
      label: '지도',
    },
    {
      href: '/mypage',
      icon: <User className="h-5 w-5" />,
      label: '마이페이지',
    },
    {
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
      label: '설정',
    },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-neutral-100 border-r border-neutral-200">
      <div className="flex-1 overflow-auto py-6 px-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
            />
          ))}
        </nav>
      </div>
      <div className="border-t border-neutral-200 p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );
} 