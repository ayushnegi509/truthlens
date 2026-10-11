import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useLanguage } from '../context/LanguageContext';
import {
  PhoneCall,
  Globe,
  ShieldAlert,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Scale,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  HelpCircle,
  Scan
} from 'lucide-react';

interface ReportHelpPageProps {
  onNavigateHome: () => void;
  onNavigateToScanner: () => void;
  onNavigateToLearn: () => void;
  onNavigateToHistory: () => void;
  onNavigateToPrivacy: () => void;
}

export const ReportHelpPage: React.FC<ReportHelpPageProps> = ({
  onNavigateHome,
  onNavigateToScanner,
  onNavigateToLearn,
  onNavigateToHistory,
  onNavigateToPrivacy,
}) => {
  const { t, language } = useLanguage();
  const [copiedHelpline, setCopiedHelpline] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const copyToClipboard = (text: string, type: 'phone' | 'url') => {
    navigator.clipboard.writeText(text);
    if (type === 'phone') {
      setCopiedHelpline(true);
      setTimeout(() => setCopiedHelpline(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const faqs = [
    {
      q: language === 'hi' 
        ? 'यदि मेरा या मेरे किसी परिचित का डीपफेक बना दिया गया है, तो पहला कदम क्या होना चाहिए?'
        : 'If my likeness or my acquaintance has been deepfaked, what is the immediate first step?',
      a: language === 'hi'
        ? 'सबसे पहले घबराएं नहीं। उस सामग्री को सोशल मीडिया से सीधे हटाने के लिए कहने से पहले उसका डिजिटल साक्ष्य सुरक्षित करें (स्क्रीनशॉट, पोस्ट यूआरएल, क्रिएटर का प्रोफाइल यूआरएल और वीडियो/फोटो फाइल डाउनलोड करें)। इसके बाद तुरंत cybercrime.gov.in पर रिपोर्ट दर्ज करें और संबंधित सोशल मीडिया प्लेटफॉर्म पर IT Rules 2021 के तहत तत्काल हटाने का अनुरोध भेजें।'
        : 'Do not panic. Before demanding deletion, preserve digital proof: capture full screenshots with timestamps, copy direct post URLs and profile links, and save the unaltered media file. Immediately file an incident on cybercrime.gov.in and invoke the mandatory 24-hour takedown clause on the host platform.'
    },
    {
      q: language === 'hi'
        ? 'भारत में राष्ट्रीय साइबर अपराध हेल्पलाइन 1930 क्या है और यह कब काम करती है?'
        : 'What is India’s National Cybercrime Helpline 1930 and how does it assist victims?',
      a: language === 'hi'
        ? 'हेल्पलाइन 1930 गृह मंत्रालय (MHA) के भारतीय साइबर अपराध समन्वय केंद्र (I4C) द्वारा 24x7 संचालित एक राष्ट्रीय टोल-फ्री आपातकालीन सेवा है। यह विशेष रूप से वित्तीय धोखाधड़ी, वॉयस क्लोन घोटालों, और महिलाओं तथा बच्चों के खिलाफ साइबर उत्पीड़न के मामलों में त्वरित प्रतिक्रिया और शिकायत दर्ज करने में सहायता करती है।'
        : 'Helpline 1930 is a 24x7 toll-free emergency service established by the Ministry of Home Affairs (MHA) and Indian Cyber Crime Coordination Centre (I4C). It provides rapid intervention for cyber financial fraud (including voice cloning scams) and expedited lodging of complaints regarding harassment and non-consensual media.'
    },
    {
      q: language === 'hi'
        ? 'भारतीय कानून (IT Act & IT Rules 2021) के तहत डीपफेक के खिलाफ क्या कानूनी प्रावधान हैं?'
        : 'What legal provisions exist under Indian Law (IT Act & IT Rules 2021) against deepfakes?',
      a: language === 'hi'
        ? 'सूचना प्रौद्योगिकी अधिनियम (IT Act 2000) की धारा 66E (निजता का उल्लंघन), धारा 66D (कंप्यूटर संसाधन द्वारा प्रतिरूपण कर धोखाधड़ी), और धारा 67/67A (यौन रूप से स्पष्ट सामग्री का इलेक्ट्रॉनिक प्रकाशन) के तहत 3 से 7 साल तक का कारावास हो सकता है। इसके अलावा, IT Rules 2021 के नियम 3(2)(b) के तहत सोशल मीडिया प्लेटफॉर्म्स को गैर-सहमति वाली आपत्तिजनक सामग्री रिपोर्ट किए जाने के 24 घंटे के भीतर हटानी अनिवार्य है।'
        : 'Under the Information Technology Act 2000: Section 66E penalizes violation of privacy, Section 66D punishes cheating by impersonation using computer resources (up to 3 years imprisonment), and Sections 67/67A penalize publishing sexually explicit synthetic material (up to 5–7 years imprisonment). Under Rule 3(2)(b) of the IT Rules 2021, platforms must remove non-consensual intimate imagery within 24 hours of notification.'
    },
    {
      q: language === 'hi'
        ? 'क्या cybercrime.gov.in पर गुमनाम (Anonymous) शिकायत दर्ज की जा सकती है?'
        : 'Can I file an anonymous complaint on cybercrime.gov.in?',
      a: language === 'hi'
        ? 'हाँ, राष्ट्रीय साइबर अपराध पोर्टल पर महिलाओं और बच्चों से संबंधित आपत्तिजनक या गैर-सहमति वाली सामग्री (जैसे डीपफेक या अश्लील छेड़छाड़) के लिए "Report Anonymously" (गुमनाम रिपोर्ट) का विकल्प उपलब्ध है जिसमें आपको अपना नाम सार्वजनिक करने की आवश्यकता नहीं होती।'
        : 'Yes. The portal cybercrime.gov.in provides a dedicated "Report Anonymously" pipeline for reporting incidents involving women and children (including non-consensual deepfakes and morphing) without requiring disclosure of personal identity to the general public.'
    },
    {
      q: language === 'hi'
        ? 'क्या TruthLens की फॉरेंसिक रिपोर्ट को पुलिस शिकायत या एफआईआर में तकनीकी सहायता के तौर पर लगाया जा सकता है?'
        : 'Can TruthLens forensic reports and SHA-256 hashes be attached to a police complaint or incident report?',
      a: language === 'hi'
        ? 'हाँ। TruthLens एक तकनीकी "एविडेंस-सपोर्ट रिपोर्ट" (Evidence-Support Report) उत्पन्न करता है जिसमें मीडिया का SHA-256 हैश, टाइमस्टैम्प, और एआई विसंगतियों के तकनीकी विवरण शामिल होते हैं। इसे आप अपनी 1930 या cybercrime.gov.in रिपोर्ट के साथ प्रारंभिक तकनीकी संदर्भ के रूप में संलग्न कर सकते हैं। (ध्यान दें: यह तकनीकी सहायता सामग्री है, कानूनी सलाह नहीं)।'
        : 'Yes. TruthLens generates an exportable technical "evidence-support report" detailing client-side SHA-256 cryptographic hashes, timeline anomaly logs, and synthetic likelihood scores. These can be attached to your official cybercrime.gov.in submission or police complaint as corroborating technical context. (Note: TruthLens provides technical analysis and general information, not legal advice).'
    },
    {
      q: language === 'hi'
        ? 'सोशल मीडिया प्लेटफॉर्म्स (Instagram, WhatsApp, X, YouTube) पर डीपफेक की रिपोर्ट कैसे करें?'
        : 'How do I submit formal takedown notices directly to major social platforms?',
      a: language === 'hi'
        ? 'प्रत्येक प्लेटफॉर्म पर पोस्ट के तीन बिंदुओं (...) पर क्लिक करके "Report" -> "Impersonation" (प्रतिरूपण) या "Harassment" चुनें। यदि वे 24 घंटे में नहीं हटाते हैं, तो प्लेटफॉर्म के भारत स्थित शिकायत अधिकारी (Grievance Officer) को ईमेल भेजें और सूचना प्रौद्योगिकी नियम 2021 का संदर्भ दें।'
        : 'Tap the three dots on the offending post, select "Report" -> "Impersonation", "Synthetically Altered Media", or "Non-consensual Content". If unresponsive within 24 hours, escalate to the platform’s India-based Resident Grievance Officer citing Rule 3(2)(b) of the IT Rules 2021.'
    }
  ];

  const immediateSteps = [
    {
      step: '1',
      title: language === 'hi' ? 'डिजिटल साक्ष्य सुरक्षित करें' : 'Preserve Digital Evidence',
      desc: language === 'hi'
        ? 'कंटेंट डिलीट होने से पहले स्क्रीनशॉट लें, वेब पेज का पूरा यूआरएल कॉपी करें, और मूल फाइल डाउनलोड करें।'
        : 'Capture full-screen captures with timestamp, copy permalinks, and save the original file before it is taken down or altered.',
      badge: language === 'hi' ? 'महत्वपूर्ण' : 'Critical'
    },
    {
      step: '2',
      title: language === 'hi' ? 'TruthLens से फॉरेंसिक ऑडिट करें' : 'Run TruthLens Forensic Audit',
      desc: language === 'hi'
        ? 'फाइल को हमारे स्कैनर में डालें, SHA-256 हैश प्राप्त करें और विस्तृत एविडेंस-सपोर्ट रिपोर्ट (PDF) डाउनलोड करें।'
        : 'Calculate SHA-256 integrity hash and generate an exportable evidence-support report (PDF) detailing synthetic anomaly signatures.',
      badge: language === 'hi' ? 'तकनीकी सहायता' : 'Evidence Support'
    },
    {
      step: '3',
      title: language === 'hi' ? '1930 हेल्पलाइन या cybercrime.gov.in पर रिपोर्ट करें' : 'Report to 1930 / cybercrime.gov.in',
      desc: language === 'hi'
        ? '24x7 हेल्पलाइन 1930 पर कॉल करें या सीधे भारत सरकार के आधिकारिक साइबर पोर्टल पर शिकायत दर्ज करें।'
        : 'Call the 24x7 helpline 1930 or lodge an official complaint on the National Cyber Crime Reporting Portal.',
      badge: language === 'hi' ? 'कानूनी शिकायत' : 'Legal Action'
    },
    {
      step: '4',
      title: language === 'hi' ? '24-घंटे का टेकडाउन नोटिस जारी करें' : 'Trigger 24-Hour Intermediary Takedown',
      desc: language === 'hi'
        ? 'आईटी नियम 2021 के तहत सोशल मीडिया प्लेटफॉर्म के ग्रीवेंस ऑफिसर को लिखित शिकायत भेजकर 24 घंटे में हटाने की मांग करें।'
        : 'Notify platform Grievance Officers invoking Rule 3(2)(b) of IT Rules 2021 for mandatory takedown within 24 hours.',
      badge: language === 'hi' ? 'आईटी नियम 2021' : 'Mandatory Rule'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onScanClick={onNavigateToScanner}
        onHomeClick={onNavigateHome}
        onHistoryClick={onNavigateToHistory}
        onPrivacyClick={onNavigateToPrivacy}
        onLearnClick={onNavigateToLearn}
        onHelpClick={() => {}}
        currentPage="help"
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Hero Header */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-navy-900 to-navy-950 border border-rose-900/40 p-8 sm:p-12 text-white shadow-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-600/15 blur-3xl rounded-full pointer-events-none" />

          <div className="relative max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t.help.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {t.help.title}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              {t.help.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="tel:1930"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold shadow-lg shadow-rose-600/30 transition-all cursor-pointer text-sm"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{t.help.emergencyCallBtn}</span>
              </a>

              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition-all cursor-pointer text-sm"
              >
                <Globe className="w-4 h-4" />
                <span>{t.help.visitPortalBtn}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
              </a>
            </div>
          </div>
        </section>

        {/* PRIMARY INDIAN CYBERCRIME RESOURCE TILES */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: 1930 Helpline */}
          <Card variant="danger" className="p-6 sm:p-8 space-y-5 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center">
                <PhoneCall className="w-7 h-7" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                24x7 Toll-Free
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Ministry of Home Affairs (MHA) • I4C
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                National Cyber Crime Helpline: 1930
              </h2>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.help.helplineDesc}
            </p>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 space-y-2">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {language === 'hi' ? 'हेल्पलाइन पर रिपोर्ट करने के लिए आवश्यक विवरण:' : 'Key information to keep ready when calling:'}
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                <li>{language === 'hi' ? 'घटना की तारीख और अनुमानित समय' : 'Date, time, and timezone of the incident'}</li>
                <li>{language === 'hi' ? 'धोखाधड़ी में प्रयुक्त फोन नंबर या सोशल मीडिया प्रोफाइल लिंक' : 'Suspect phone number, UPI ID, or account link'}</li>
                <li>{language === 'hi' ? 'यदि वित्तीय नुकसान हुआ है, तो बैंक खाता संख्या' : 'Bank transaction reference or UTR numbers if money was stolen'}</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="tel:1930"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold text-sm hover:bg-rose-500 transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 1930 Now</span>
              </a>

              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard('1930', 'phone')}
                leftIcon={copiedHelpline ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              >
                {copiedHelpline ? (language === 'hi' ? 'कॉपी हो गया' : 'Copied!') : (language === 'hi' ? 'नंबर कॉपी करें' : 'Copy Number')}
              </Button>
            </div>
          </Card>

          {/* Card 2: cybercrime.gov.in */}
          <Card variant="interactive" className="p-6 sm:p-8 space-y-5 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center">
                <Globe className="w-7 h-7" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                Official Portal
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Government of India
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                cybercrime.gov.in
              </h2>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.help.portalDesc}
            </p>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 space-y-2">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {language === 'hi' ? 'पोर्टल पर उपलब्ध श्रेणियां:' : 'Specialized Portal Pipelines:'}
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Report Crime Against Women & Children:</strong>{' '}
                  {language === 'hi' ? 'गुमनाम या प्रत्यक्ष शिकायत (डीपफेक व अश्लील छेड़छाड़)' : 'Anonymous and identified reporting of non-consensual imagery'}
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Report Other Cyber Crimes:</strong>{' '}
                  {language === 'hi' ? 'वित्तीय धोखाधड़ी, पहचान चोरी, और प्रतिरूपण' : 'Impersonation, identity fraud, and voice clone wire scams'}
                </li>
              </ul>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white font-semibold text-sm hover:bg-cyan-500 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>cybercrime.gov.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard('https://cybercrime.gov.in', 'url')}
                leftIcon={copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              >
                {copiedUrl ? (language === 'hi' ? 'कॉपी हो गया' : 'Copied!') : (language === 'hi' ? 'लिंक कॉपी करें' : 'Copy Link')}
              </Button>
            </div>
          </Card>
        </section>

        {/* IMMEDIATE RESPONSE 4-STEP PROTOCOL */}
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
              <span>{language === 'hi' ? 'तुरंत कदम उठाएं' : 'Incident Playbook'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t.help.immediateStepsTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {language === 'hi'
                ? 'यदि किसी ने आपकी या किसी परिचित की सिंथेटिक तस्वीर या आवाज का दुरुपयोग किया है, तो इस क्रम का पालन करें।'
                : 'Follow this strict 4-step sequence to safeguard your legal standing and initiate swift takedowns.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {immediateSteps.map((s) => (
              <Card key={s.step} variant="default" className="p-6 space-y-3 relative flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-extrabold font-mono text-cyan-500/40">
                      0{s.step}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {s.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="pt-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'प्रोटोकॉल चरण' : 'Actionable'}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* LEGAL RIGHTS UNDER IT ACT & IT RULES 2021 */}
        <section className="p-6 sm:p-8 rounded-2xl bg-slate-100/70 dark:bg-navy-900/60 border border-slate-200/80 dark:border-navy-800/80 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              <Scale className="w-4 h-4" />
              <span>{language === 'hi' ? 'विधिक प्रावधान' : 'Statutory Protections'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t.help.legalRightsTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {language === 'hi' 
                ? 'भारतीय कानून में डीपफेक, प्रतिरूपण और गैर-सहमति वाले संपादन के विरुद्ध कड़े कानूनी प्रावधान हैं।' 
                : 'Indian statutory provisions and intermediary guidelines penalizing deepfake creators and non-compliant platforms.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-navy-700/80 space-y-2">
              <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 uppercase">
                IT Act 2000 — Section 66D
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'hi' ? 'प्रतिरूपण (Cheating by Impersonation)' : 'Cheating by Personation'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === 'hi'
                  ? 'कंप्यूटर संसाधन का उपयोग करके किसी अन्य व्यक्ति के रूप में छल करने पर 3 साल तक की जेल और ₹1 लाख तक का जुर्माना।'
                  : 'Penalizes using computer resources to pretend to be another person (e.g., deepfake video/voice) with up to 3 years imprisonment and ₹1,00,000 fine.'}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-navy-700/80 space-y-2">
              <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 uppercase">
                IT Act 2000 — Section 66E & 67A
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'hi' ? 'निजता हनन और अश्लीलता' : 'Privacy Violation & Morphed Media'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === 'hi'
                  ? 'बिना सहमति के किसी के निजी अंगों या चेहरे को जोड़कर अश्लील सामग्री प्रसारित करने पर 5 से 7 साल तक का कारावास।'
                  : 'Penalizes capturing or transmitting private bodily images or publishing morphed sexually explicit content with 5 to 7 years imprisonment.'}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-navy-700/80 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase">
                IT Rules 2021 — Rule 3(2)(b)
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'hi' ? '24 घंटे में अनिवार्य टेकडाउन' : 'Mandatory 24-Hour Removal'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === 'hi'
                  ? 'सोशल मीडिया मध्यस्थों को शिकायत प्राप्त होने के 24 घंटे के भीतर गैर-सहमति वाली सामग्री हटाना अनिवार्य है, अन्यथा वे अपनी कानूनी सुरक्षा खो सकते हैं।'
                  : 'Platforms must disable access to non-consensual intimate imagery within 24 hours of notification, forfeiting safe harbor immunity if delinquent.'}
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
            <Scale className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold uppercase tracking-wider block">
                {language === 'hi' ? 'महत्वपूर्ण सूचना — सामान्य जानकारी, कानूनी सलाह नहीं' : 'Important Notice — General Information, Not Legal Advice'}
              </span>
              <p className="leading-relaxed opacity-90">
                {language === 'hi'
                  ? 'यह पृष्ठ केवल तकनीकी और सामान्य जागरूकता उद्देश्यों के लिए प्रदान किया गया है। यह आधिकारिक कानूनी सलाह नहीं है। विशिष्ट कानूनी कार्रवाई या एफआईआर के लिए कृपया योग्य अधिवक्ता, कानूनी सलाहकार या स्थानीय पुलिस साइबर सेल से परामर्श लें।'
                  : 'This page provides general technical guidance and informational resources only. It does not constitute formal legal counsel. For actionable legal proceedings, consultation with a licensed legal practitioner or local police cyber cell is advised.'}
              </p>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION */}
        <section id="faq" className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <HelpCircle className="w-4 h-4" />
              <span>{language === 'hi' ? 'सामान्य प्रश्नोत्तर' : 'Support Answers'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t.help.faqTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t.help.faqSubtitle}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none hover:bg-slate-50 dark:hover:bg-navy-850 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                    <span className="p-1 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-navy-800/80 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* BOTTOM ACTION CTA */}
        <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-cyan-500/10 border border-rose-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {language === 'hi' ? 'क्या आपके पास संदेहास्पद मीडिया फाइल है?' : 'Do you suspect a video, audio, or image is manipulated?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {language === 'hi'
                ? 'TruthLens स्कैनर में फाइल डालें। हमारा शून्य-डेटा प्रतिधारण इंजन बिना किसी डेटा संचय के त्वरित फॉरेंसिक साक्ष्य उत्पन्न करता है।'
                : 'Upload to TruthLens for instantaneous, zero-retention neural forensics and exportable evidentiary reports.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={onNavigateToScanner}
              leftIcon={<Scan className="w-4 h-4" />}
            >
              {language === 'hi' ? 'अभी फॉरेंसिक स्कैन करें' : 'Run Forensic Scan'}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onNavigateToLearn}
            >
              {language === 'hi' ? 'डीपफेक लक्षण सीखें' : 'Read Deepfake Guide'}
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
