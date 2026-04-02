'use client';

import { usePathname } from 'next/navigation';
import { TransitionLink } from '@/components/TransitionContext';

const links = [
  { href: '/',           label: 'Home' },
  { href: '/skills',     label: 'Skills' },
  { href: '/experience', label: 'Experience' },
  { href: '/contact',    label: 'Contact' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav">
      <ul>
        {links.map(({ href, label }) => (
          <li key={href}>
            <TransitionLink href={href} className={pathname === href ? 'active' : ''}>
              {label}
            </TransitionLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
