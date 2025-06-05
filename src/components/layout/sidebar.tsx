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
  onClick?: () => Promise<void> | void;
}

const SidebarItem = ({ href, icon, label, active, onClick }: SidebarItemProps) => {
  const content = (
    <>
      {icon}
      <span>{label}</span>
    </>
  );
  
  const className = cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
    active 
      ? 'bg-primary-100 text-primary-700 font-medium' 
      : 'text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'
  );
  
  return onClick ? (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  ) : (
    <Link href={href} className={className}>
      {content}
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
      href: '/map',
      icon: <Map className="h-5 w-5" />,
      label: '지도',
    },
    {
      href: '/mypage',
      icon: <User className="h-5 w-5" />,
      label: '마이페이지',
    },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-neutral-100 border-r border-neutral-200">
      <div className="flex-1 overflow-auto py-6 px-3">
        <nav className="flex flex-col gap-1">
          {/* 첫 4개 메뉴 항목 수직 배치 */}
          {navItems.slice(0, 4).map((item) => (
            <SidebarItem
              key={item.href + item.label}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
              onClick={item.onClick}
            />
          ))}
        </nav>
      </div>
      
      {/* 설정 및 로그아웃 버튼 수평 배치 */}
      <div className="border-t border-neutral-200 p-3">
        <div className="flex flex-row justify-between">
          <SidebarItem
            key="/settings"
            href="/settings"
            icon={<Settings className="h-5 w-5" />}
            label="설정"
            active={pathname === '/settings'}
          />
          <SidebarItem
            key="logout"
            href="#"
            icon={<LogOut className="h-5 w-5" />}
            label="로그아웃"
            active={false}
            onClick={handleSignOut}
          />
        </div>
      </div>
    </div>
  );
} 