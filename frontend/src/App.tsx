import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { LandingPage } from './pages/LandingPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ResultPage } from './pages/ResultPage';
import { HistoryPage } from './pages/HistoryPage';
import { PrivacyCenterPage } from './pages/PrivacyCenterPage';
import { LearnPage } from './pages/LearnPage';
import { ReportHelpPage } from './pages/ReportHelpPage';
import { AnalyzeResponse } from './types/analysis';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'analysis' | 'result' | 'history' | 'privacy' | 'learn' | 'help'>('landing');
  const [initialFile, setInitialFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);

  useEffect(() => {
    // Listen to hash changes if present
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#analysis' || hash === '#scanner') {
        setCurrentPage('analysis');
      } else if (hash === '#result') {
        setCurrentPage('result');
        setAnalysisResult((prev) => {
          if (!prev) {
            try {
              const raw = localStorage.getItem('truthlens_scan_history');
              if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.length > 0 && parsed[0].rawResponse) {
                  return parsed[0].rawResponse;
                }
              }
            } catch {
              // fallback
            }
          }
          return prev;
        });
      } else if (hash === '#history') {
        setCurrentPage('history');
      } else if (hash === '#privacy') {
        setCurrentPage('privacy');
      } else if (hash === '#learn') {
        setCurrentPage('learn');
      } else if (hash === '#help' || hash === '#report') {
        setCurrentPage('help');
      } else if (hash === '' || hash === '#home') {
        setCurrentPage('landing');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateToAnalysis = (file?: File) => {
    if (file) {
      setInitialFile(file);
    }
    setCurrentPage('analysis');
    window.location.hash = '#analysis';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setCurrentPage('landing');
    window.location.hash = '#home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToResult = (result: AnalyzeResponse) => {
    setAnalysisResult(result);
    setCurrentPage('result');
    window.location.hash = '#result';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHistory = () => {
    setCurrentPage('history');
    window.location.hash = '#history';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPrivacy = () => {
    setCurrentPage('privacy');
    window.location.hash = '#privacy';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLearn = () => {
    setCurrentPage('learn');
    window.location.hash = '#learn';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHelp = () => {
    setCurrentPage('help');
    window.location.hash = '#help';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        {currentPage === 'landing' ? (
          <LandingPage 
            onNavigateToAnalysis={navigateToAnalysis} 
            onNavigateToHistory={navigateToHistory}
            onNavigateToPrivacy={navigateToPrivacy}
            onNavigateToLearn={navigateToLearn}
            onNavigateToHelp={navigateToHelp}
          />
        ) : currentPage === 'result' ? (
          <ResultPage
            result={analysisResult}
            onNavigateHome={navigateToHome}
            onNavigateToScanner={navigateToAnalysis}
            onNavigateToHistory={navigateToHistory}
            onNavigateToPrivacy={navigateToPrivacy}
            onNavigateToLearn={navigateToLearn}
            onNavigateToHelp={navigateToHelp}
          />
        ) : currentPage === 'history' ? (
          <HistoryPage
            onNavigateHome={navigateToHome}
            onNavigateToScanner={navigateToAnalysis}
            onNavigateToResult={navigateToResult}
            onNavigateToPrivacy={navigateToPrivacy}
            onNavigateToLearn={navigateToLearn}
            onNavigateToHelp={navigateToHelp}
          />
        ) : currentPage === 'privacy' ? (
          <PrivacyCenterPage
            onNavigateHome={navigateToHome}
            onNavigateToScanner={navigateToAnalysis}
            onNavigateToHistory={navigateToHistory}
            onNavigateToLearn={navigateToLearn}
            onNavigateToHelp={navigateToHelp}
          />
        ) : currentPage === 'learn' ? (
          <LearnPage
            onNavigateHome={navigateToHome}
            onNavigateToScanner={navigateToAnalysis}
            onNavigateToHelp={navigateToHelp}
            onNavigateToHistory={navigateToHistory}
            onNavigateToPrivacy={navigateToPrivacy}
          />
        ) : currentPage === 'help' ? (
          <ReportHelpPage
            onNavigateHome={navigateToHome}
            onNavigateToScanner={navigateToAnalysis}
            onNavigateToLearn={navigateToLearn}
            onNavigateToHistory={navigateToHistory}
            onNavigateToPrivacy={navigateToPrivacy}
          />
        ) : (
          <AnalysisPage 
            onNavigateHome={navigateToHome} 
            onNavigateToHistory={navigateToHistory}
            onNavigateToPrivacy={navigateToPrivacy}
            onNavigateToLearn={navigateToLearn}
            onNavigateToHelp={navigateToHelp}
            initialFile={initialFile}
            onAnalysisCompleted={navigateToResult}
          />
        )}
      </LanguageProvider>
    </ThemeProvider>
  );
}
