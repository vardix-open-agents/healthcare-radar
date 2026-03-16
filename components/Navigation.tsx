'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/presentations', label: 'Presentations' },
    { href: '/opportunities', label: 'Opportunities' },
    { href: '/themes', label: 'Themes' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-zinc-900 font-bold text-sm">H</span>
            </div>
            <span className="font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors">
              Healthcare Radar
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-zinc-800 text-cyan-400'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side - could add user menu, theme toggle, etc. */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
              Varden Team
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
