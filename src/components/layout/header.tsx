'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Home, Calendar, Map, User, Settings, LogOut, Bell } from 'lucide-react';
import { signOut } from 'next-auth/react';

// 애니메이션 변수
const headerVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 100,
      damping: 20,
      duration: 0.5
    }
  }
};

const logoVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      duration: 0.5,
      delay: 0.2
    }
  }
};

const navItemVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: (i: number) => ({ 
    y: 0, 
    opacity: 1,
    transition: { 
      duration: 0.3,
      delay: 0.3 + (i * 0.1)
    }
  })
};

interface HeaderProps {
  isLoggedIn?: boolean;
}

export function Header({ isLoggedIn = false }: HeaderProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isLoaded, setIsLoaded] = useState(false);
  
  // 명시적으로 boolean으로 변환하여 로그인 상태를 확실하게 함
  const userIsLoggedIn = Boolean(isLoggedIn);
  
  // 디버깅용 로깅 추가
  useEffect(() => {
    console.log('Header - isLoggedIn prop:', isLoggedIn);
    console.log('Header - userIsLoggedIn:', userIsLoggedIn);
  }, [isLoggedIn, userIsLoggedIn]);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // 네비게이션 항목
  const navItems = [
    {
      href: '/dashboard',
      icon: <Home className="h-4 w-4 mr-1" />,
      label: '대시보드',
    },
    {
      href: '/map',
      icon: <Map className="h-4 w-4 mr-1" />,
      label: '지도',
    },
    {
      href: '/mypage',
      icon: <User className="h-4 w-4 mr-1" />,
      label: '마이페이지',
    },
    {
      href: '/settings',
      icon: <Settings className="h-4 w-4 mr-1" />,
      label: '설정',
    },
  ];
  
  return (
    <motion.header 
      className={`w-full py-4 px-6 flex flex-col md:flex-row justify-between items-center gap-4 ${
        isHomePage ? 'bg-primary-500 text-white' : 'bg-white border-b border-neutral-200 shadow-sm'
      }`}
      initial="hidden"
      animate={isLoaded ? "visible" : "hidden"}
      variants={headerVariants}
    >
      <motion.div
        variants={logoVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        className="flex items-center"
      >
        <div className="flex items-center gap-2">
          <div className="text-primary-500 bg-white rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isHomePage ? 'text-primary-500' : 'text-primary-500'}`}>
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
          </div>
          <span className={`text-4xl font-semibold ${
            isHomePage ? 'text-white' : 'text-blue-500'
          }`}>
            NUVI
          </span>
        </div>
      </motion.div>
      
      <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center md:justify-end">
        {userIsLoggedIn ? (
          <>
            {/* 네비게이션 메뉴 */}
            <div className="flex items-center gap-1 md:gap-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  custom={index}
                  variants={navItemVariants}
                  initial="hidden"
                  animate={isLoaded ? "visible" : "hidden"}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    asChild 
                    variant={pathname === item.href ? "default" : "ghost"}
                    size="sm"
                    className={`
                      ${isHomePage ? 'text-white hover:bg-primary-700' : ''}
                      ${pathname === item.href ? 'bg-primary-100 text-primary-700 hover:bg-primary-200 hover:text-primary-800' : ''}
                    `}
                  >
                    <Link href={item.href} className="flex items-center">
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* 로그아웃 버튼 */}
            <motion.div
              custom={navItems.length}
              variants={navItemVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                size="sm"
                className={isHomePage ? 'text-white hover:bg-primary-700' : ''}
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>로그아웃</span>
              </Button>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              custom={0}
              variants={navItemVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                asChild 
                variant="ghost" 
                className={isHomePage ? 'text-white hover:bg-primary-700' : ''}
              >
                <Link href="/login">로그인</Link>
              </Button>
            </motion.div>
            
            <motion.div
              custom={1}
              variants={navItemVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                asChild 
                variant={isHomePage ? 'outline' : 'default'} 
                className={isHomePage ? 'bg-white text-primary-500 hover:bg-neutral-100' : ''}
              >
                <Link href="/signup">회원가입</Link>
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </motion.header>
  );
} 