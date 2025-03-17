'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// 애니메이션 변수
const footerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

export function Footer() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <motion.footer 
      className="w-full py-6 px-6 bg-neutral-100"
      initial="hidden"
      animate={isLoaded ? "visible" : "hidden"}
      variants={footerVariants}
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.div 
            className="mb-4 md:mb-0"
            variants={itemVariants}
          >
            <p className="text-sm text-neutral-500">© 2023 공항 모빌리티. All rights reserved.</p>
          </motion.div>
          <div className="flex gap-6">
            {[
              { href: '/terms', label: '이용약관' },
              { href: '/privacy', label: '개인정보처리방침' },
              { href: '/contact', label: '고객센터' }
            ].map((item, index) => (
              <motion.div
                key={item.href}
                variants={itemVariants}
                whileHover={{ y: -2 }}
              >
                <Link 
                  href={item.href} 
                  className="text-sm text-neutral-500 hover:text-primary-500 transition-colors duration-200"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  );
} 