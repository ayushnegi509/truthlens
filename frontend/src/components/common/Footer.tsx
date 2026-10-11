import React from 'react';
import { ShieldCheck, ExternalLink, PhoneCall, HelpCircle, Lock, BookOpen } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface FooterProps {
  onScanClick?: () => void;
  onHistoryClick?: () => void;
  onPrivacyClick?: () => void;
  onLearnClick?: () => void;
  onHelpClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onScanClick,
  onHistoryClick,
  onPrivacyClick,
  onLearnClick,
  onHelpClick,
}) => {
  const { language } = useLanguage();

  return (
    <footer className="w-full bg-slate-100 dark:bg-navy-950 border-t border-slate-200 dark:border-navy-800/80 text-slate-600 dark:text-slate-400 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Simple Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Truth<span className="text-cyan-500">Lens</span>
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              {language === 'hi'
                ? 'फोटो, वीडियो और ऑडियो क्लिप असली हैं या एआई द्वारा बनाए गए हैं, इसकी जांच का एक सरल और निजी साधन।'
                : 'A simple, private tool to check if photos, videos, and audio clips are real or AI-generated.'}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {language === 'hi' ? 'नेविगेशन' : 'Navigate'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onScanClick) onScanClick();
                    else window.location.hash = '#analysis';
                  }}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left"
                >
                  {language === 'hi' ? 'मीडिया विश्लेषण' : 'Analyze media'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onHistoryClick) onHistoryClick();
                    else window.location.hash = '#history';
                  }}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left"
                >
                  {language === 'hi' ? 'स्कैन इतिहास' : 'History'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onLearnClick) onLearnClick();
                    else window.location.hash = '#learn';
                  }}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
                  {language === 'hi' ? 'सीखें और समझें' : 'Learn'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onPrivacyClick) onPrivacyClick();
                    else window.location.hash = '#privacy';
                  }}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  {language === 'hi' ? 'प्राइवेसी सेंटर' : 'Privacy'}
                </button>
              </li>
            </ul>
          </div>

          {/* Report & Help (Moved into Footer as requested) */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {language === 'hi' ? 'रिपोर्ट और सहायता' : 'Report & Help'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onHelpClick) onHelpClick();
                    else window.location.hash = '#help';
                  }}
                  className="text-rose-500 dark:text-rose-400 font-medium hover:underline transition-colors flex items-center gap-1.5 text-left"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {language === 'hi' ? 'रिपोर्ट और सहायता गाइड' : 'Report & Help Guide'}
                </button>
              </li>
              <li>
                <a 
                  href="tel:1930" 
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
                  {language === 'hi' ? 'हेल्पलाइन 1930 (टोल-फ्री)' : 'Helpline 1930 (Toll-Free)'}
                </a>
              </li>
              <li>
                <a 
                  href="https://cybercrime.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                >
                  cybercrime.gov.in
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* How It Works & Scale */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {language === 'hi' ? 'गाइड' : 'Guide'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="#how-it-works" 
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  {language === 'hi' ? 'यह कैसे काम करता है' : 'How it works'}
                </a>
              </li>
              <li>
                <a 
                  href="#verdict-scale" 
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  {language === 'hi' ? 'परिणाम पैमाना' : 'Result scale'}
                </a>
              </li>
              <li>
                <a 
                  href="#privacy" 
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  {language === 'hi' ? 'डेटा प्राइवेसी' : 'Privacy principles'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Clean bottom row */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-navy-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {language === 'hi' ? 'प्रामाणिक' : 'Likely real'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {language === 'hi' ? 'अनिर्णायक' : 'Unsure'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {language === 'hi' ? 'एआई निर्मित' : 'Likely AI'}
            </span>
          </div>

          <p>© {new Date().getFullYear()} TruthLens. {language === 'hi' ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
};
