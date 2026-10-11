import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from './Button';
import { 
  ShieldCheck, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Fingerprint,
  Languages
} from 'lucide-react';

export interface NavbarProps {
  onScanClick?: () => void;
  onHomeClick?: () => void;
  onHistoryClick?: () => void;
  onPrivacyClick?: () => void;
  onLearnClick?: () => void;
  onHelpClick?: () => void;
  currentPage?: 'home' | 'analysis' | 'history' | 'privacy' | 'result' | 'learn' | 'help';
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onScanClick, 
  onHomeClick, 
  onHistoryClick,
  onPrivacyClick,
  onLearnClick,
  currentPage = 'home' 
}) => {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { 
      id: 'analysis',
      label: language === 'hi' ? 'विश्लेषण' : 'Analyze', 
      href: '#analysis', 
      action: onScanClick || (() => { window.location.hash = '#analysis'; }),
      active: currentPage === 'analysis'
    },
    { 
      id: 'history',
      label: language === 'hi' ? 'इतिहास' : 'History', 
      href: '#history', 
      action: onHistoryClick || (() => { window.location.hash = '#history'; }),
      active: currentPage === 'history'
    },
    { 
      id: 'learn',
      label: language === 'hi' ? 'सीखें' : 'Learn', 
      href: '#learn', 
      action: onLearnClick || (() => { window.location.hash = '#learn'; }),
      active: currentPage === 'learn'
    },
    { 
      id: 'privacy',
      label: language === 'hi' ? 'प्राइवेसी' : 'Privacy', 
      href: '#privacy', 
      action: onPrivacyClick || (() => { window.location.hash = '#privacy'; }),
      active: currentPage === 'privacy'
    },
  ];

  const handleLinkClick = (link: typeof navLinks[0]) => {
    setMobileMenuOpen(false);
    if (link.action) {
      link.action();
      return;
    }
    if (currentPage !== 'home' && onHomeClick) {
      onHomeClick();
      setTimeout(() => {
        const element = document.querySelector(link.href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }
    const element = document.querySelector(link.href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/90 dark:bg-navy-950/90 border-b border-slate-200/80 dark:border-navy-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo - shrink-0 to prevent any overlap */}
        <button 
          onClick={() => {
            if (onHomeClick) {
              onHomeClick();
            } else {
              window.location.hash = '#home';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-3 shrink-0 focus:outline-none cursor-pointer text-left group"
          aria-label="TruthLens Home"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-500/35 transition-all">
            <ShieldCheck className="w-5 h-5 text-white transition-transform group-hover:scale-105" />
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Truth<span className="text-cyan-500">Lens</span>
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links: Only Analyze, History, Learn, Privacy */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleLinkClick(link)}
              className={`text-sm font-medium transition-colors cursor-pointer py-1 ${
                link.active
                  ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop Actions: language toggle, theme toggle, and ONE button */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* Language Toggle: Clean, clear EN / हिन्दी display */}
          <button
            onClick={toggleLanguage}
            type="button"
            aria-label={`Switch language. Current: ${language === 'en' ? 'English' : 'हिंदी'}`}
            title={`Switch to ${language === 'en' ? 'हिंदी (Hindi)' : 'English'}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-navy-900 hover:bg-slate-200 dark:hover:bg-navy-850 border border-slate-200 dark:border-navy-800 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span className={language === 'en' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-400 dark:text-slate-500 font-normal'}>EN</span>
            <span className="text-slate-300 dark:text-navy-700">/</span>
            <span className={language === 'hi' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-400 dark:text-slate-500 font-normal'}>हिन्दी</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-navy-900 hover:bg-slate-200 dark:hover:bg-navy-850 border border-slate-200 dark:border-navy-800 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* One Primary Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={onScanClick}
            leftIcon={<Fingerprint className="w-4 h-4" />}
          >
            {language === 'hi' ? 'मीडिया जांचें' : 'Analyze media'}
          </Button>
        </div>

        {/* Mobile Hamburger & Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Language Toggle */}
          <button
            onClick={toggleLanguage}
            type="button"
            aria-label="Toggle language"
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 flex items-center gap-1 cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-500" />
            <span className={language === 'en' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-400 font-normal'}>EN</span>
            <span className="text-slate-300 dark:text-navy-700">/</span>
            <span className={language === 'hi' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-400 font-normal'}>हि</span>
          </button>

          <button
            onClick={toggleTheme}
            type="button"
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            aria-label="Toggle mobile menu"
            className="p-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:bg-slate-200 dark:hover:bg-navy-850 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-navy-800 bg-white/95 dark:bg-navy-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleLinkClick(link)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  link.active
                    ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-900 hover:text-cyan-600 dark:hover:text-cyan-400'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="pt-2 border-t border-slate-200 dark:border-navy-850">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={() => {
                setMobileMenuOpen(false);
                onScanClick?.();
              }}
              leftIcon={<Fingerprint className="w-4 h-4" />}
            >
              {language === 'hi' ? 'मीडिया जांचें' : 'Analyze media'}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
