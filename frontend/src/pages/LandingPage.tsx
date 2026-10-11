import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { QuickScanModal } from '../components/upload/QuickScanModal';
import { 
  ArrowRight, 
  Fingerprint, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  ShieldCheck, 
  Lock, 
  EyeOff,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface LandingPageProps {
  onNavigateToAnalysis?: (file?: File) => void;
  onNavigateToHistory?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToLearn?: () => void;
  onNavigateToHelp?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigateToAnalysis,
  onNavigateToHistory,
  onNavigateToPrivacy,
  onNavigateToLearn,
  onNavigateToHelp,
}) => {
  const { language } = useLanguage();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const openScanModal = () => {
    if (onNavigateToAnalysis) {
      onNavigateToAnalysis();
    } else {
      setIsScanModalOpen(true);
    }
  };
  const closeScanModal = () => setIsScanModalOpen(false);

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const isHindi = language === 'hi';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans selection:bg-cyan-500/25 selection:text-cyan-200">
      {/* 
        Navbar:
        Keeps only: Analyze, History, Learn, Privacy, plus language toggle, theme toggle, and one button.
      */}
      <Navbar 
        onScanClick={openScanModal} 
        onHistoryClick={onNavigateToHistory}
        onPrivacyClick={onNavigateToPrivacy}
        onLearnClick={onNavigateToLearn}
        onHelpClick={onNavigateToHelp}
        currentPage="home"
      />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION                                                           */}
        {/* ========================================================================= */}
        <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          {/* Subtle background ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative space-y-8 max-w-3xl">
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              {isHindi ? (
                <>
                  सच्चाई की{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
                    पहचान करें।
                  </span>
                </>
              ) : (
                <>
                  Verify what&apos;s{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
                    real.
                  </span>
                </>
              )}
            </h1>

            {/* ONE short sentence */}
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
              {isHindi
                ? 'एक फोटो, वीडियो या ऑडियो क्लिप अपलोड करें और देखें कि इसके एआई द्वारा बनाए जाने की कितनी संभावना है।'
                : 'Upload a photo, video or audio clip and see how likely it is to be AI-generated.'}
            </p>

            {/* ONE primary button + ONE small text link */}
            <div className="flex flex-col items-center justify-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={openScanModal}
                leftIcon={<Fingerprint className="w-5 h-5" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto px-8 py-3.5 text-base shadow-lg shadow-cyan-500/20"
              >
                {isHindi ? 'मीडिया जांचें' : 'Analyze media'}
              </Button>

              <button
                type="button"
                onClick={scrollToHowItWorks}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer py-1"
              >
                <span>{isHindi ? 'यह कैसे काम करता है' : 'How it works'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. HOW IT WORKS (3 simple steps with one short line each)                 */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-20 md:py-28 border-t border-slate-200/80 dark:border-navy-800/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isHindi ? 'यह कैसे काम करता है' : 'How it works'}
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400">
                {isHindi ? 'तीन सरल चरण, तुरंत परिणाम।' : 'Three simple steps to check your media.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <Card variant="default" className="p-8 space-y-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">01</span>
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isHindi ? 'अपलोड करें' : 'Upload'}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    {isHindi
                      ? 'अपने डिवाइस से कोई भी फोटो, वीडियो या ऑडियो फ़ाइल चुनें।'
                      : 'Choose any image, video, or audio file from your device.'}
                  </p>
                </div>
              </Card>

              {/* Step 2 */}
              <Card variant="default" className="p-8 space-y-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">02</span>
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isHindi ? 'विश्लेषण' : 'Analyze'}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    {isHindi
                      ? 'हमारा सिस्टम एआई हेरफेर या निर्माण के संकेतों की जांच करता है।'
                      : 'Our system inspects the file for signs of AI generation or editing.'}
                  </p>
                </div>
              </Card>

              {/* Step 3 */}
              <Card variant="default" className="p-8 space-y-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">03</span>
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isHindi ? 'परिणाम प्राप्त करें' : 'Get your result'}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    {isHindi
                      ? 'प्रमुख विवरणों के साथ असली से एआई तक एक स्पष्ट स्कोर देखें।'
                      : 'See a clear likelihood score from real to AI, with key details.'}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. RESULT SCALE (Single clean green/amber/red bar with 3 labels)          */}
        {/* ========================================================================= */}
        <section id="verdict-scale" className="py-20 md:py-28 border-t border-slate-200/80 dark:border-navy-800/80 bg-slate-100/50 dark:bg-navy-900/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isHindi ? 'परिणाम पैमाना' : 'Result scale'}
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400">
                {isHindi
                  ? 'आपके मीडिया स्कोर को समझने के लिए एक सरल गाइड।'
                  : 'A simple guide to understanding your media score.'}
              </p>
            </div>

            {/* A single clean green / amber / red bar */}
            <div className="max-w-4xl mx-auto space-y-3">
              <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner bg-slate-200 dark:bg-navy-800 p-0.5">
                <div 
                  className="bg-emerald-500 rounded-l-full transition-all" 
                  style={{ width: '25%' }}
                  title="Likely real (0% - 25%)"
                />
                <div 
                  className="bg-amber-400 transition-all mx-0.5" 
                  style={{ width: '45%' }}
                  title="Unsure (26% - 69%)"
                />
                <div 
                  className="bg-rose-500 rounded-r-full transition-all" 
                  style={{ width: '30%' }}
                  title="Likely AI (70% - 100%)"
                />
              </div>

              {/* Bar scale indicators */}
              <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-slate-400 px-1">
                <span>0%</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">25%</span>
                <span className="text-amber-700 dark:text-amber-400 font-semibold">70%</span>
                <span>100%</span>
              </div>
            </div>

            {/* 3 labels with one short line each */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* Likely real */}
              <div className="p-6 rounded-2xl bg-white dark:bg-navy-900/60 border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {isHindi ? 'प्रामाणिक (Likely real)' : 'Likely real'}
                    </h3>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isHindi
                    ? 'एआई हेरफेर का कोई या नगण्य संकेत नहीं मिला।'
                    : 'Little to no signs of AI manipulation detected.'}
                </p>
              </div>

              {/* Unsure */}
              <div className="p-6 rounded-2xl bg-white dark:bg-navy-900/60 border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {isHindi ? 'अनिर्णायक (Unsure)' : 'Unsure'}
                    </h3>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isHindi
                    ? 'कुछ असामान्य पैटर्न मिले, पर परिणाम अनिर्णायक हैं।'
                    : 'Some unusual patterns found, but results are inconclusive.'}
                </p>
              </div>

              {/* Likely AI */}
              <div className="p-6 rounded-2xl bg-white dark:bg-navy-900/60 border border-rose-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shrink-0" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {isHindi ? 'एआई निर्मित (Likely AI)' : 'Likely AI'}
                    </h3>
                  </div>
                  <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isHindi
                    ? 'एआई निर्माण या डीपफेक हेरफेर के मजबूत प्रमाण मिले।'
                    : 'Strong indicators of AI generation or deepfake tampering.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. PRIVACY (One short section, 3 short points maximum)                   */}
        {/* ========================================================================= */}
        <section id="privacy" className="py-20 md:py-28 border-t border-slate-200/80 dark:border-navy-800/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isHindi ? 'आपका मीडिया निजी रहता है' : 'Your media stays private'}
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400">
                {isHindi
                  ? 'गोपनीयता हमारी पहली प्राथमिकता है।'
                  : 'We prioritize confidentiality when evaluating your files.'}
              </p>
            </div>

            {/* Exactly 3 short points */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-navy-900/60 border border-slate-200/80 dark:border-navy-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <EyeOff className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'कोई फ़ाइल सहेजी नहीं जाती' : 'No files stored'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isHindi
                    ? 'मीडिया केवल अस्थायी मेमोरी में जांची जाती है और विश्लेषण के तुरंत बाद हटा दी जाती है।'
                    : 'Media is processed in temporary memory and deleted right after analysis.'}
                </p>
              </div>

              <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-navy-900/60 border border-slate-200/80 dark:border-navy-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'एआई प्रशिक्षण में कभी नहीं' : 'Never used for AI training'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isHindi
                    ? 'आपके अपलोड का उपयोग कभी भी किसी एआई मॉडल को प्रशिक्षित करने के लिए नहीं किया जाता।'
                    : 'Your uploads are never used to train or improve any AI models.'}
                </p>
              </div>

              <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-navy-900/60 border border-slate-200/80 dark:border-navy-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'सुरक्षित ट्रांसमिशन' : 'Secure transmission'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isHindi
                    ? 'सब कुछ एन्क्रिप्टेड HTTPS कनेक्शन के माध्यम से सुरक्षित रूप से भेजा जाता है।'
                    : 'Everything is sent over an encrypted HTTPS connection.'}
                </p>
              </div>
            </div>

            {/* Optional link to Privacy Center */}
            {onNavigateToPrivacy && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onNavigateToPrivacy}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  <span>{isHindi ? 'प्राइवेसी सेंटर में और जानें' : 'Learn more in our Privacy Center'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. FINAL CALL TO ACTION                                                   */}
        {/* ========================================================================= */}
        <section className="py-20 md:py-28 border-t border-slate-200/80 dark:border-navy-800/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isHindi ? 'मीडिया की जांच करने के लिए तैयार हैं?' : 'Ready to check your media?'}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              {isHindi
                ? 'कुछ ही सेकंड में विश्लेषण शुरू करें। निःशुल्क और सुरक्षित।'
                : 'Start an analysis in seconds. Free and private.'}
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={openScanModal}
                leftIcon={<Fingerprint className="w-5 h-5" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="px-8 py-3.5 text-base"
              >
                {isHindi ? 'मीडिया जांचें' : 'Analyze media'}
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <Footer 
        onScanClick={openScanModal}
        onHistoryClick={onNavigateToHistory}
        onPrivacyClick={onNavigateToPrivacy}
        onLearnClick={onNavigateToLearn}
        onHelpClick={onNavigateToHelp}
      />

      {/* Quick Scan Modal for file dropping / upload */}
      <QuickScanModal 
        isOpen={isScanModalOpen} 
        onClose={closeScanModal} 
        onStartAnalysis={(file) => {
          if (onNavigateToAnalysis) {
            onNavigateToAnalysis(file);
          }
        }}
      />
    </div>
  );
};
