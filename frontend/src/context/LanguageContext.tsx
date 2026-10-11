import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

export interface Translations {
  // Navigation & General
  nav: {
    howItWorks: string;
    features: string;
    verdictScale: string;
    learn: string;
    reportHelp: string;
    scanHistory: string;
    privacyCenter: string;
    launchScanner: string;
    home: string;
    brandTag: string;
    languageToggle: string;
  };
  // Verdict Scale
  verdict: {
    authentic: string;
    suspicious: string;
    deepfake: string;
    authenticDesc: string;
    suspiciousDesc: string;
    deepfakeDesc: string;
    riskRangeAuthentic: string;
    riskRangeSuspicious: string;
    riskRangeDeepfake: string;
    standardScales: string;
    demoBadge: string;
  };
  // Hero & CTA
  hero: {
    badge: string;
    titleStart: string;
    titleHighlight: string;
    subtitle: string;
    analyzeNow: string;
    exploreScale: string;
    precision: string;
    fastScreen: string;
    zeroRetention: string;
  };
  // Learn Page
  learn: {
    badge: string;
    title: string;
    subtitle: string;
    tabAll: string;
    tabTech: string;
    tabSpotting: string;
    tabEthics: string;
    howTheyWorkTitle: string;
    howTheyWorkDesc: string;
    spotTipsTitle: string;
    spotTipsDesc: string;
    articlesTitle: string;
    readTime: string;
    interactiveQuizTitle: string;
    interactiveQuizDesc: string;
  };
  // Report / Help Page
  help: {
    badge: string;
    title: string;
    subtitle: string;
    helplineTitle: string;
    helplineDesc: string;
    portalTitle: string;
    portalDesc: string;
    immediateStepsTitle: string;
    evidenceChecklistTitle: string;
    faqTitle: string;
    faqSubtitle: string;
    emergencyCallBtn: string;
    visitPortalBtn: string;
    legalRightsTitle: string;
  };
  // Simple Landing Page Sections
  landing: {
    heroTitle: string;
    heroSubtitle: string;
    analyzeBtn: string;
    howItWorksLink: string;
    howTitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    scaleTitle: string;
    scaleSubtitle: string;
    likelyReal: string;
    likelyRealDesc: string;
    unsure: string;
    unsureDesc: string;
    likelyAi: string;
    likelyAiDesc: string;
    privacyTitle: string;
    privacySubtitle: string;
    priv1Title: string;
    priv1Desc: string;
    priv2Title: string;
    priv2Desc: string;
    priv3Title: string;
    priv3Desc: string;
    privacyCenterLink: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaBtn: string;
  };
  // Footer
  footer: {
    mission: string;
    status: string;
    forensicsCol: string;
    platformCol: string;
    trustCol: string;
    rights: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      howItWorks: 'How It Works',
      features: 'Features',
      verdictScale: 'Result Scale',
      learn: 'Learn',
      reportHelp: 'Report & Help',
      scanHistory: 'History',
      privacyCenter: 'Privacy',
      launchScanner: 'Analyze media',
      home: 'Home',
      brandTag: 'Media Verification',
      languageToggle: 'Language',
    },
    landing: {
      heroTitle: "Verify what's real.",
      heroSubtitle: 'Upload a photo, video or audio clip and see how likely it is to be AI-generated.',
      analyzeBtn: 'Analyze media',
      howItWorksLink: 'How it works',
      howTitle: 'How it works',
      step1Title: 'Upload',
      step1Desc: 'Choose any photo, video, or audio file from your device.',
      step2Title: 'Analyze',
      step2Desc: 'Our system checks the file for signs of AI generation or editing.',
      step3Title: 'Get your result',
      step3Desc: 'See a clear likelihood score from real to AI, with key details.',
      scaleTitle: 'Result scale',
      scaleSubtitle: 'A clear scale to help you understand your verification score.',
      likelyReal: 'Likely real',
      likelyRealDesc: 'Little to no signs of AI manipulation detected.',
      unsure: 'Unsure',
      unsureDesc: 'Some unusual patterns found, but results are inconclusive.',
      likelyAi: 'Likely AI',
      likelyAiDesc: 'Strong indicators of AI generation or tampering detected.',
      privacyTitle: 'Your media stays private',
      privacySubtitle: 'We built TruthLens with privacy by design at every step.',
      priv1Title: 'No files stored',
      priv1Desc: 'Media is processed in temporary memory and deleted right after analysis.',
      priv2Title: 'Never used for AI training',
      priv2Desc: 'Your uploads are never used to train or improve any AI models.',
      priv3Title: 'Secure transmission',
      priv3Desc: 'Everything is transferred safely using encrypted HTTPS connections.',
      privacyCenterLink: 'Explore Privacy Center',
      ctaTitle: 'Ready to check your media?',
      ctaSubtitle: 'Start an analysis in seconds. Free and private.',
      ctaBtn: 'Analyze media',
    },
    verdict: {
      authentic: 'Likely real',
      suspicious: 'Unsure',
      deepfake: 'Likely AI',
      authenticDesc: 'Little to no digital manipulation detected (0% - 25% synthetic probability).',
      suspiciousDesc: 'Compression anomalies or partial synthesis detected (26% - 69% synthetic probability).',
      deepfakeDesc: 'High probability generative AI tampering or neural synthesis detected (70% - 100%).',
      riskRangeAuthentic: '0% — 25%',
      riskRangeSuspicious: '26% — 69%',
      riskRangeDeepfake: '70% — 100%',
      standardScales: 'Result Scale:',
      demoBadge: 'Demo mode: results are simulated',
    },
    hero: {
      badge: 'Media Verification',
      titleStart: 'Verify what\'s ',
      titleHighlight: 'real.',
      subtitle: 'Upload a photo, video or audio clip and see how likely it is to be AI-generated.',
      analyzeNow: 'Analyze media',
      exploreScale: 'How it works',
      precision: 'High Precision',
      fastScreen: 'Fast Screen',
      zeroRetention: 'Data Retention',
    },
    learn: {
      badge: 'Educational Knowledge Base',
      title: 'Deepfake Forensics & Digital Literacy',
      subtitle: 'Understand how generative artificial intelligence alters video, audio, and images, and learn practical sensory and analytical techniques to detect synthetic deception.',
      tabAll: 'All Topics',
      tabTech: 'How Deepfakes Work',
      tabSpotting: 'How to Spot Deepfakes',
      tabEthics: 'Awareness & Safety',
      howTheyWorkTitle: 'Under the Hood: Generative AI Architecture',
      howTheyWorkDesc: 'From autoencoders and GANs to modern latent diffusion and neural audio vocoders.',
      spotTipsTitle: '8 Clues to Identify Deepfake Media',
      spotTipsDesc: 'Forensic sensory guidelines to spot synthetic artifacts with the naked eye and ear.',
      articlesTitle: 'Deepfake Awareness Articles & Case Studies',
      readTime: 'min read',
      interactiveQuizTitle: 'Deepfake Spotter Checklist',
      interactiveQuizDesc: 'Step-by-step verification protocol to run through before sharing any viral media.',
    },
    help: {
      badge: 'Support & Incident Response',
      title: 'Report Deepfakes & Cybercrime Resources',
      subtitle: 'Step-by-step guidance on reporting synthetic impersonation, non-consensual imagery, and digital scams with dedicated Indian cybercrime portals and 24/7 emergency helplines.',
      helplineTitle: 'National Cyber Crime Helpline (India)',
      helplineDesc: 'Toll-free emergency helpline 1930 operated by the Indian Cyber Crime Coordination Centre (I4C), MHA.',
      portalTitle: 'National Cyber Crime Reporting Portal',
      portalDesc: 'Official Government of India portal (cybercrime.gov.in) to file complaints regarding cyber harassment and deepfakes.',
      immediateStepsTitle: 'Immediate Response Checklist: If You are Targeted',
      evidenceChecklistTitle: 'How to Preserve Digital Evidence',
      faqTitle: 'Frequently Asked Questions (FAQ)',
      faqSubtitle: 'Legal rights, removal procedures under IT Act & IT Rules 2021, and forensic support.',
      emergencyCallBtn: 'Call 1930 Helpline',
      visitPortalBtn: 'Visit cybercrime.gov.in',
      legalRightsTitle: 'Indian Legal Provisions & IT Rules',
    },
    footer: {
      mission: 'A simple, private tool to check if photos, videos, and audio clips are real or generated by AI.',
      status: 'Operational',
      forensicsCol: 'TruthLens',
      platformCol: 'Help & Resources',
      trustCol: 'Privacy',
      rights: 'TruthLens. All rights reserved.',
    },
  },
  hi: {
    nav: {
      howItWorks: 'यह कैसे काम करता है',
      features: 'विशेषताएं',
      verdictScale: 'परिणाम पैमाना',
      learn: 'सीखें',
      reportHelp: 'रिपोर्ट और सहायता',
      scanHistory: 'इतिहास',
      privacyCenter: 'प्राइवेसी',
      launchScanner: 'मीडिया जांचें',
      home: 'होम',
      brandTag: 'मीडिया सत्यापन',
      languageToggle: 'भाषा',
    },
    landing: {
      heroTitle: 'सच्चाई की पहचान करें।',
      heroSubtitle: 'एक फोटो, वीडियो या ऑडियो क्लिप अपलोड करें और देखें कि इसके एआई द्वारा बनाए जाने की कितनी संभावना है।',
      analyzeBtn: 'मीडिया जांचें',
      howItWorksLink: 'यह कैसे काम करता है',
      howTitle: 'यह कैसे काम करता है',
      step1Title: 'अपलोड करें',
      step1Desc: 'अपने डिवाइस से कोई भी फोटो, वीडियो या ऑडियो फ़ाइल चुनें।',
      step2Title: 'जांचें',
      step2Desc: 'हमारा सिस्टम एआई हेरफेर या निर्माण के संकेतों की जांच करता है।',
      step3Title: 'परिणाम प्राप्त करें',
      step3Desc: 'प्रमुख विवरणों के साथ असली से एआई तक एक स्पष्ट स्कोर देखें।',
      scaleTitle: 'परिणाम पैमाना',
      scaleSubtitle: 'अपने मीडिया सत्यापन स्कोर को समझने के लिए एक सरल पैमाना।',
      likelyReal: 'प्रामाणिक (Likely real)',
      likelyRealDesc: 'एआई हेरफेर का कोई या नगण्य संकेत नहीं मिला।',
      unsure: 'अनिर्णायक (Unsure)',
      unsureDesc: 'कुछ असामान्य पैटर्न मिले, पर परिणाम स्पष्ट नहीं हैं।',
      likelyAi: 'एआई निर्मित (Likely AI)',
      likelyAiDesc: 'एआई निर्माण या हेरफेर के मजबूत प्रमाण मिले।',
      privacyTitle: 'आपका मीडिया निजी रहता है',
      privacySubtitle: 'हमने ट्रुथलेंस को हर कदम पर मजबूत प्राइवेसी के साथ बनाया है।',
      priv1Title: 'कोई फ़ाइल सहेजी नहीं जाती',
      priv1Desc: 'मीडिया केवल मेमोरी में प्रोसेस होता है और जांच के तुरंत बाद हटा दिया जाता है।',
      priv2Title: 'एआई प्रशिक्षण में कभी नहीं',
      priv2Desc: 'आपके अपलोड का इस्तेमाल एआई मॉडल सिखाने के लिए कभी नहीं होता।',
      priv3Title: 'सुरक्षित ट्रांसमिशन',
      priv3Desc: 'सब कुछ एन्क्रिप्टेड HTTPS कनेक्शन के माध्यम से सुरक्षित रूप से भेजा जाता है।',
      privacyCenterLink: 'प्राइवेसी सेंटर देखें',
      ctaTitle: 'मीडिया की जांच करने के लिए तैयार हैं?',
      ctaSubtitle: 'कुछ ही सेकंड में विश्लेषण शुरू करें। निःशुल्क और सुरक्षित।',
      ctaBtn: 'मीडिया जांचें',
    },
    verdict: {
      authentic: 'प्रामाणिक (Likely real)',
      suspicious: 'अनिर्णायक (Unsure)',
      deepfake: 'एआई निर्मित (Likely AI)',
      authenticDesc: 'डिजिटल हेरफेर का कोई या नगण्य संकेत (0% - 25% सिंथेटिक संभावना)।',
      suspiciousDesc: 'फ़्रीक्वेंसी असंगति या आंशिक हेरफेर का पता चला (26% - 69% संभावना)।',
      deepfakeDesc: 'जेनरेटिव एआई फेस-स्वैप या वॉइस क्लोनिंग के मजबूत प्रमाण (70% - 100%)।',
      riskRangeAuthentic: '0% — 25%',
      riskRangeSuspicious: '26% — 69%',
      riskRangeDeepfake: '70% — 100%',
      standardScales: 'परिणाम पैमाना:',
      demoBadge: 'डेमो मोड: परिणाम सिम्युलेटेड हैं',
    },
    hero: {
      badge: 'मीडिया सत्यापन',
      titleStart: 'सच्चाई की ',
      titleHighlight: 'पहचान करें।',
      subtitle: 'एक फोटो, वीडियो या ऑडियो क्लिप अपलोड करें और देखें कि इसके एआई द्वारा बनाए जाने की कितनी संभावना है।',
      analyzeNow: 'मीडिया जांचें',
      exploreScale: 'यह कैसे काम करता है',
      precision: 'सटीकता दर',
      fastScreen: 'फास्ट स्क्रीन',
      zeroRetention: 'डेटा संचय',
    },
    learn: {
      badge: 'शैक्षणिक ज्ञान केंद्र',
      title: 'डीपफेक फॉरेंसिक्स और डिजिटल साक्षरता',
      subtitle: 'समझें कि जेनरेटिव आर्टिफिशियल इंटेलिजेंस वीडियो, ऑडियो और तस्वीरों को कैसे बदलता है, और सिंथेटिक धोखे की पहचान करने के व्यावहारिक तरीकों को जानें।',
      tabAll: 'सभी विषय',
      tabTech: 'डीपफेक कैसे काम करते हैं',
      tabSpotting: 'डीपफेक कैसे पहचानें',
      tabEthics: 'जागरूकता और सुरक्षा',
      howTheyWorkTitle: 'तकनीकी कार्यप्रणाली: जेनरेटिव एआई आर्किटेक्चर',
      howTheyWorkDesc: 'ऑटोएनकोडर और GANs से लेकर आधुनिक लेटेंट डिफ्यूजन और न्यूरल ऑडियो वोकोडर तक।',
      spotTipsTitle: 'डीपफेक मीडिया पहचानने के 8 प्रमुख संकेत',
      spotTipsDesc: 'अपनी आंखों और कानों से सिंथेटिक विसंगतियों को पहचानने के लिए फॉरेंसिक दिशानिर्देश।',
      articlesTitle: 'डीपफेक जागरूकता लेख और केस स्टडीज',
      readTime: 'मिनट का पठन',
      interactiveQuizTitle: 'डीपफेक डिटेक्शन चेकलिस्ट',
      interactiveQuizDesc: 'किसी भी वायरल मीडिया को साझा करने से पहले जांचने के लिए चरणबद्ध सत्यापन प्रोटोकॉल।',
    },
    help: {
      badge: 'सहायता और घटना निवारण',
      title: 'डीपफेक रिपोर्टिंग और साइबर अपराध संसाधन',
      subtitle: 'सिंथेटिक प्रतिरूपण, बिना सहमति की तस्वीरों और डिजिटल धोखाधड़ी की रिपोर्ट करने के लिए भारतीय साइबर अपराध पोर्टल और 24/7 आपातकालीन हेल्पलाइन की पूरी जानकारी।',
      helplineTitle: 'राष्ट्रीय साइबर अपराध हेल्पलाइन (भारत)',
      helplineDesc: 'गृह मंत्रालय के भारतीय साइबर अपराध समन्वय केंद्र (I4C) द्वारा संचालित टोल-फ्री हेल्पलाइन 1930।',
      portalTitle: 'राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल',
      portalDesc: 'साइबर उत्पीड़न और डीपफेक शिकायतों के लिए आधिकारिक भारत सरकार पोर्टल (cybercrime.gov.in)।',
      immediateStepsTitle: 'यदि आप शिकार हुए हैं तो तत्काल उठाए जाने वाले कदम',
      evidenceChecklistTitle: 'डिजिटल साक्ष्य सुरक्षित रखने का तरीका',
      faqTitle: 'अक्सर पूछे जाने वाले प्रश्न (FAQ)',
      faqSubtitle: 'आईटी अधिनियम, आईटी नियम 2021 के तहत कानूनी अधिकार और हटाने की प्रक्रिया।',
      emergencyCallBtn: '1930 हेल्पलाइन पर कॉल करें',
      visitPortalBtn: 'cybercrime.gov.in पर जाएं',
      legalRightsTitle: 'भारतीय कानूनी प्रावधान और आईटी नियम',
    },
    footer: {
      mission: 'फोटो, वीडियो और ऑडियो असली हैं या एआई द्वारा बनाए गए हैं, इसकी जांच का एक सरल और निजी साधन।',
      status: 'सक्रिय',
      forensicsCol: 'TruthLens',
      platformCol: 'सहायता और संसाधन',
      trustCol: 'प्राइवेसी',
      rights: 'TruthLens. सर्वाधिकार सुरक्षित।',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'truthlens-language-preference';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'en' || stored === 'hi') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      document.documentElement.lang = language;
    } catch {
      // ignore
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
