'use client';
import { useEffect } from 'react';
import { useThemeStore } from '@/store/theme-store';

const THEME_LINK_ID = 'paymydine-theme-css';
const hrefFor = (id: string) => `/themes/${id}.css`;

export default function ThemeCSSLoader() {
  const themeId = useThemeStore(s => s.currentThemeId || 'clean-light');

  useEffect(() => {
    const href = hrefFor(themeId);
    let link = document.getElementById(THEME_LINK_ID) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = THEME_LINK_ID;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const target = new URL(href, location.origin).href;
    if (link.href !== target) link.href = target;
    document.documentElement.setAttribute('data-theme', themeId);
  }, [themeId]);

  return null;
}