import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useLanguage } from '../context/LanguageContext';
import {
  Brain,
  Eye,
  Mic,
  Video,
  Layers,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  Scan,
  Activity,
  FileText
} from 'lucide-react';

interface LearnPageProps {
  onNavigateHome: () => void;
  onNavigateToScanner: () => void;
  onNavigateToHelp: () => void;
  onNavigateToHistory: () => void;
  onNavigateToPrivacy: () => void;
}

export const LearnPage: React.FC<LearnPageProps> = ({
  onNavigateHome,
  onNavigateToScanner,
  onNavigateToHelp,
  onNavigateToHistory,
  onNavigateToPrivacy,
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'tech' | 'spotting' | 'articles'>('all');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // Deepfake Mechanics
  const techCards = [
    {
      id: 'autoencoders',
      title: language === 'hi' ? 'ऑटोएनकोडर और लेटेंट मैपिंग' : 'Autoencoders & Latent Embeddings',
      subtitle: language === 'hi' ? 'फेस-स्वैप का आधारभूत आर्किटेक्चर' : 'Foundational architecture of face swaps',
      icon: <Brain className="w-6 h-6 text-cyan-500" />,
      color: 'cyan',
      description: language === 'hi' 
        ? 'एक साझा एनकोडर चेहरे के मुख्य फीचर्स को कंप्रेस करता है, जिसके बाद दो अलग-अलग डिकोडर स्रोत और लक्ष्य चेहरे के भावों को स्वैप करते हैं।'
        : 'An encoder compresses facial geometry into a compact latent space. Two separate decoders (source and target) reconstruct expressions on the target identity frame-by-frame.',
      indicators: [
        language === 'hi' ? 'जबड़े और गालों के किनारों पर धुंधलापन' : 'Subtle blur along the jawline and hairline perimeter',
        language === 'hi' ? 'तेज सिर घुमाने पर चेहरे का फिसलना' : 'Warping during abrupt 3D head yaw and pitch rotations',
        language === 'hi' ? 'आंखों के पुतलियों के आकार में असंगतता' : 'Loss of pupil specular highlights in varied lighting'
      ]
    },
    {
      id: 'gans',
      title: language === 'hi' ? 'GANs (जेनरेटिव एडवरसेरियल नेटवर्क्स)' : 'GANs (Generative Adversarial Networks)',
      subtitle: language === 'hi' ? 'जेनरेटर बनाम डिस्क्रिमिनेटर की प्रतिस्पर्धा' : 'Generator vs Discriminator dynamic',
      icon: <Layers className="w-6 h-6 text-purple-500" />,
      color: 'purple',
      description: language === 'hi'
        ? 'जेनरेटर नए चेहरे या तस्वीरें बनाता है, जबकि डिस्क्रिमिनेटर यह तय करता है कि वे असली हैं या नकली। करोड़ों बार प्रशिक्षण के बाद यह अत्यंत यथार्थवादी परिणाम देता है।'
        : 'A Generator network invents synthetic imagery while a Discriminator judges realism against ground truth. Over millions of iterations, the generator learns to produce photorealistic fakes.',
      indicators: [
        language === 'hi' ? 'फ्रीक्वेंसी डोमेन में चेकरबोर्ड आर्टिफैक्ट्स' : 'High-frequency checkerboard artifacts in Fourier (FFT) domain',
        language === 'hi' ? 'अजीब पृष्ठभूमि बनावट या ज्यामितीय विकृति' : 'Incoherent asymmetric ear jewelry or deformed background patterns',
        language === 'hi' ? 'आंखों के चश्मे के फ्रेम का विरूपण' : 'Eyeglass frame warping or irregular dental structures'
      ]
    },
    {
      id: 'diffusion',
      title: language === 'hi' ? 'लेटेंट डिफ्यूजन मॉडल्स' : 'Latent Diffusion Models',
      subtitle: language === 'hi' ? 'शोर हटाने (Denoising) की अत्याधुनिक तकनीक' : 'State-of-the-art text-to-image synthesis',
      icon: <Sparkles className="w-6 h-6 text-blue-500" />,
      color: 'blue',
      description: language === 'hi'
        ? 'गॉसियन शोर (Noise) से शुरू होकर, डिफ्यूजन मॉडल धीरे-धीरे शोर हटाकर अत्यधिक विस्तृत तस्वीरें बनाते हैं (उदा. Midjourney, Stable Diffusion, Flux)।'
        : 'Starting from pure Gaussian noise, latent diffusion iteratively reverses entropy to manifest hyper-detailed scenes matching textual or conditioning prompts.',
      indicators: [
        language === 'hi' ? 'उंगलियों और हाथ के पोरों की संख्या में गड़बड़ी' : 'Hyper-smooth plastic skin textures and unnatural finger counts',
        language === 'hi' ? 'प्रकाश और परछाइयों की भौतिक असंगतता' : 'Incoherent shadow angles relative to environmental light sources',
        language === 'hi' ? 'कपड़ों या पृष्ठभूमि में अस्पष्ट गैर-मौजूद अक्षर' : 'Alien gibberish text rendering on signs or fabric labels'
      ]
    },
    {
      id: 'voice-cloning',
      title: language === 'hi' ? 'न्यूरल वॉइस क्लोनिंग और वोकोडर' : 'Neural Voice Cloning & Vocoders',
      subtitle: language === 'hi' ? 'ऑडियो क्लोनिंग और लिप-सिंक हेरफेर' : 'Acoustic waveform synthesis',
      icon: <Mic className="w-6 h-6 text-amber-500" />,
      color: 'amber',
      description: language === 'hi'
        ? 'कुछ सेकंड के वॉयस सैंपल से व्यक्ति की आवाज की बनावट (Timbre) का विश्लेषण कर मेल-स्पेक्ट्रोग्राम बनाया जाता है और न्यूरल वोकोडर (HiFi-GAN) द्वारा क्लोन ऑडियो तैयार किया जाता है।'
        : 'A target voice sample as brief as 3 seconds is decomposed into acoustic embeddings. Neural vocoders synthesize novel speech patterns matching the original vocal timbre.',
      indicators: [
        language === 'hi' ? 'प्राकृतिक सांस लेने और गले की खनक का अभाव' : 'Absence of natural micro-breaths, throat clears, and saliva acoustics',
        language === 'hi' ? 'असामान्य स्थिर पिच या रोबोटिक टोन' : 'Robotic pitch cadence lacking genuine emotional inflection',
        language === 'hi' ? 'मुंह की हरकतों (Visemes) के साथ आवाज का अंतर' : 'Lip synchronization latency when pronouncing plosives (P, B, M)'
      ]
    }
  ];

  // Spotting Tips
  const spottingTips = [
    {
      number: '01',
      title: language === 'hi' ? 'पलक झपकाने की दर देखें (Blink Rate)' : 'Observe Eye Blinking Cadence',
      desc: language === 'hi'
        ? 'सामान्य इंसान हर मिनट 15-20 बार पलक झपकाता है। कई शुरुआती डीपफेक में पलकें बहुत कम, बहुत तेज या आधी ही झपकती हैं।'
        : 'Natural humans blink 15–20 times per minute. Generative models trained on open-eye photo datasets often produce irregular or static blink cycles.',
      icon: <Eye className="w-5 h-5 text-cyan-400" />
    },
    {
      number: '02',
      title: language === 'hi' ? 'होठों और आवाज का तालमेल (Lip-Sync Timing)' : 'Scrutinize Phoneme-Lip Alignment',
      desc: language === 'hi'
        ? 'अक्षर ‘B’, ‘P’, और ‘M’ बोलते समय दोनों होंठ आपस में पूरी तरह मिलने चाहिए। ऑडियो डबिंग या वॉयस क्लोनिंग में अक्सर 50-100 मिलीसेकंड का अंतराल होता है।'
        : 'Watch labial plosives (P, B, M) where lips must firmly close. Synthetic speech often exhibits a 40–120ms latency or unnatural open-mouth movements.',
      icon: <Video className="w-5 h-5 text-teal-400" />
    },
    {
      number: '03',
      title: language === 'hi' ? 'कान, गहने और चश्मे की जांच (Asymmetry Check)' : 'Inspect Facial Asymmetry & Jewelry',
      desc: language === 'hi'
        ? 'एआई मॉडल अक्सर दोनों कानों के झुमकों, चश्मे के किनारों और कॉलर की ज्यामिति को एक समान बनाए रखने में विफल रहते हैं।'
        : 'Neural networks struggle with bilateral consistency: check if left and right earrings match, and verify that eyeglass bridges remain straight during head motion.',
      icon: <Scan className="w-5 h-5 text-purple-400" />
    },
    {
      number: '04',
      title: language === 'hi' ? 'चेहरे की सीमा और जबड़े की रेखा (Boundary Seams)' : 'Check Jawlines & Neck Blending',
      desc: language === 'hi'
        ? 'चेहरा बदलने वाले मॉडल चेहरे के चारों ओर एक मास्क लगाते हैं। जबड़े, गर्दन या बालों के पास रंग में अचानक बदलाव या धुंधलापन देखें।'
        : 'Face-swapping overlays leave compression boundary seams around the jawline, chin, and hair perimeter, manifesting as faint halos or chromatic shifts.',
      icon: <Activity className="w-5 h-5 text-rose-400" />
    },
    {
      number: '05',
      title: language === 'hi' ? 'प्रकाश और परछाइयों का कोण (Lighting Vectors)' : 'Analyze Lighting and Reflections',
      desc: language === 'hi'
        ? 'आंखों की पुतली में चमक और चेहरे पर परछाईं का कोण पृष्ठभूमि के प्रकाश स्रोतों (सूरज या लाइट) से मेल खाना चाहिए।'
        : 'Look at the corneal specular reflections in the eyes. In synthetic media, corneal gleams frequently contradict the primary room lighting angle.',
      icon: <Lightbulb className="w-5 h-5 text-amber-400" />
    },
    {
      number: '06',
      title: language === 'hi' ? 'आवाज की बनावट और पृष्ठभूमि शोर (Acoustic Noise)' : 'Listen for Background Ambient Bleed',
      desc: language === 'hi'
        ? 'एआई से बनी आवाज अक्सर बहुत साफ होती है लेकिन उसमें कमरे की स्वाभाविक गूंज (Room Reverb) या वातावरण का शोर गायब होता है।'
        : 'Synthesized voice tracks often sound unnaturally isolated. When room acoustic reverb or background noise cuts out between spoken sentences, beware.',
      icon: <Mic className="w-5 h-5 text-blue-400" />
    },
    {
      number: '07',
      title: language === 'hi' ? 'त्वचा की बनावट और पसीना (Skin Texture Realism)' : 'Spot Over-Smoothed Plastic Skin',
      desc: language === 'hi'
        ? 'अत्यधिक चिकनी त्वचा, रोमछिद्रों (pores) का न दिखना और दाढ़ी या बालों के रेशों का आपस में घुल जाना कृत्रिम होने का संकेत है।'
        : 'Generative models often over-smooth epidermis, eliminating micro-pores, wrinkles, and hair follicle strands into a painted or plastic appearance.',
      icon: <Brain className="w-5 h-5 text-emerald-400" />
    },
    {
      number: '08',
      title: language === 'hi' ? 'प्रसंग और स्रोत सत्यापन (Context & Source Verification)' : 'Verify Source & Provable Context',
      desc: language === 'hi'
        ? 'हमेशा पूछें: क्या यह व्यक्ति वास्तव में ऐसी जगह मौजूद था? क्या आधिकारिक समाचार स्रोतों ने इसकी पुष्टि की है? मेटाडेटा की जांच करें।'
        : 'Cross-check real-world context: did reputable news outlets cover the event? Check original provenance metadata (C2PA) or reverse-image search.',
      icon: <CheckCircle2 className="w-5 h-5 text-cyan-400" />
    }
  ];

  // Awareness Articles
  const articles = [
    {
      id: 'financial-voice-scams',
      title: language === 'hi' ? 'सीईओ और परिवार की आवाज क्लोनिंग: ऑडियो घोटालों से कैसे बचें' : 'The Rise of Audio Clones: Anatomy of Modern CEO & Family Voice Scams',
      category: language === 'hi' ? 'वित्तीय सुरक्षा' : 'Financial Security',
      readTime: '4',
      date: 'October 2026',
      summary: language === 'hi'
        ? 'कैसे साइबर अपराधी केवल 3 सेकंड के सोशल मीडिया वीडियो से आवाज क्लोन करके आपातकालीन पैसे ट्रांसफर के लिए रिश्तेदारों या कर्मचारियों को धोखा दे रहे हैं।'
        : 'How fraudsters leverage 3-second social media audio snippets to fabricate urgent wire transfer demands, impersonating company executives and family members in distress.',
      content: language === 'hi'
        ? `आवाज क्लोनिंग तकनीक इतनी उन्नत हो चुकी है कि केवल कुछ सेकंड के ऑडियो सैंपल से किसी भी व्यक्ति के बोलने का लहजा और आवाज तैयार की जा सकती है। 

प्रमुख रक्षा उपाय:
1. **सुरक्षित पारिवारिक कोड वर्ड (Safe Word)**: जब भी कोई रिश्तेदार या अधिकारी पैसे मांगने के लिए फोन करे, तो एक पूर्व-निर्धारित कोड वर्ड पूछें जो सिर्फ आपके परिवार को पता हो।
2. **तत्काल वापस कॉल करें (Call-Back Protocol)**: फोन काटकर उस व्यक्ति के मूल सहेजे गए नंबर पर दोबारा कॉल करके पुष्टि करें।
3. **गंभीर भावनात्मक दबाव पहचानें**: घोटालेबाज हमेशा तात्कालिकता (Urgency) पैदा करते हैं जैसे कि 'तुरंत जमानत के लिए पैसे चाहिए' या 'अस्पताल बिल'। कभी भी घबराकर तुरंत भुगतान न करें।`
        : `Voice cloning technology powered by neural vocoders can synthesize human vocal timbre with alarming fidelity from brief social media audio clips. 

Key Defensive Protocols:
1. **Family Verbal Safe Word**: Establish an unguessable private passphrase known only to immediate family to authenticate emergency calls.
2. **Hang Up and Call Back**: If someone claims to be detained or in an accident, disconnect immediately and dial their verified phone number directly.
3. **Recognize Fabricated Urgency**: Attackers rely on synthetic panic to bypass rational checks. High-pressure demands for wire transfers or gift cards are immediate red flags.`
    },
    {
      id: 'elections-disinformation',
      title: language === 'hi' ? 'चुनाव और सार्वजनिक विमर्श में डीपफेक: मतदाताओं के लिए फॉरेंसिक मार्गदर्शिका' : 'Synthetic Disinformation in Public Discourse: A Voter\'s Forensic Field Guide',
      category: language === 'hi' ? 'लोकतांत्रिक साक्षरता' : 'Civic Integrity',
      readTime: '6',
      date: 'September 2026',
      summary: language === 'hi'
        ? 'चुनावी रैलियों और मतदान के दौरान नेताओं के फर्जी वीडियो कैसे गढ़े जाते हैं और मतदाताओं को कैसे भ्रमित किया जाता है।'
        : 'A deep dive into how synthetic audio drops and lip-synced speeches are deployed during high-stakes elections to sway public sentiment before voting hours.',
      content: language === 'hi'
        ? `मतदान से ठीक पहले देर रात जारी किए गए विवादास्पद ऑडियो टेप या भड़काऊ बयानों वाले वीडियो अक्सर डीपफेक होते हैं जिनका उद्देश्य मतदाताओं की धारणा को प्रभावित करना होता है।

पहचानने के उपाय:
1. **समय का ध्यान रखें (The "October Surprise" Tactic)**: चुनावों से ठीक 24-48 घंटे पहले जारी होने वाली सनसनीखेज सामग्री पर अत्यधिक संदेह करें।
2. **एकाधिक आधिकारिक स्रोतों से मिलान करें**: यदि किसी प्रमुख नेता ने कोई बड़ा बयान दिया है, तो वह कई प्रमुख राष्ट्रीय समाचार चैनलों और आधिकारिक सोशल हैंडल पर होना चाहिए।
3. **TruthLens फॉरेंसिक स्कैनर का उपयोग करें**: क्लिप को TruthLens में डालें और स्पेक्ट्रल एवं लिप-सिंक विश्लेषण की पुष्टि करें।`
        : `Late-night audio leaks and doctored public addresses deployed within hours of polling station openings are designed to inflict narrative damage before fact-checkers can respond.

Core Analytical Steps:
1. **Notice Release Timing**: Sensationally controversial footage surfaced within 24 to 48 hours of an election deserves extraordinary skepticism.
2. **Multi-Source Corroboration**: Major public statements from public figures are universally documented by multiple credentialed journalists and camera crews.
3. **Verify with TruthLens**: Extract the video file and inspect temporal coherence and lip-phoneme synchronization metrics.`
    },
    {
      id: 'non-consensual-media',
      title: language === 'hi' ? 'गैर-सहमति वाली सिंथेटिक छवियों से सुरक्षा: आपका कानूनी और तकनीकी कवच' : 'Non-Consensual Synthetic Imagery: Legal Rights & Digital Countermeasures',
      category: language === 'hi' ? 'गोपनीयता और कानून' : 'Privacy & Defense',
      readTime: '5',
      date: 'August 2026',
      summary: language === 'hi'
        ? 'यदि आपकी तस्वीर का दुरुपयोग करके डीपफेक बनाया गया है, तो तुरंत क्या करें, पुलिस और प्लेटफॉर्म्स पर कैसे कार्रवाई करें।'
        : 'Comprehensive advice on legal protections, immediate takedown mandates under IT Rules 2021, and mental health resources for victims of synthetic exploitation.',
      content: language === 'hi'
        ? `किसी की सहमति के बिना उसकी तस्वीर या वीडियो को डीपफेक में बदलना एक गंभीर साइबर अपराध है।

त्वरित कदम:
1. **साक्ष्य सुरक्षित करें**: यूआरएल, प्रोफाइल लिंक, टाइमस्टैम्प और स्क्रीनशॉट का रिकॉर्ड रखें।
2. **प्लेटफॉर्म पर रिपोर्ट करें**: आईटी नियम 2021 के तहत सोशल मीडिया प्लेटफॉर्म को रिपोर्ट किए जाने के 24 घंटे के भीतर गैर-सहमति वाली आपत्तिजनक सामग्री हटानी होगी।
3. **cybercrime.gov.in पर शिकायत दर्ज करें**: भारत सरकार के पोर्टल पर तुरंत रिपोर्ट दर्ज करें और हेल्पलाइन 1930 पर सहायता लें।`
        : `The creation and dissemination of non-consensual synthetic imagery is a severe cybercrime punishable by law.

Actionable Protocol:
1. **Preserve Digital Evidence**: Never delete the source post before recording the exact URL, user profile handles, timestamps, and cryptographic hashes.
2. **Issue 24-Hour Takedown**: Under India IT Rules 2021 Rule 3(2)(b), social media intermediaries are legally obligated to remove non-consensual intimate imagery within 24 hours of notification.
3. **Lodge Formal Complaint**: File immediately on cybercrime.gov.in and dial 1930 for rapid cyber forensic assistance.`
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        onScanClick={onNavigateToScanner}
        onHomeClick={onNavigateHome}
        onHistoryClick={onNavigateToHistory}
        onPrivacyClick={onNavigateToPrivacy}
        onLearnClick={() => {}}
        onHelpClick={onNavigateToHelp}
        currentPage="learn"
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Header Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-navy-950 border border-slate-200/50 dark:border-navy-700/80 p-8 sm:p-12 text-white shadow-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.learn.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {t.learn.title}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              {t.learn.subtitle}
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={onNavigateToScanner}
                leftIcon={<Scan className="w-4 h-4" />}
              >
                {t.nav.launchScanner}
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={onNavigateToHelp}
                leftIcon={<ShieldAlert className="w-4 h-4 text-rose-400" />}
                className="bg-navy-900/60 text-white border-white/20 hover:bg-navy-800"
              >
                {t.nav.reportHelp}
              </Button>
            </div>
          </div>
        </section>

        {/* REPORT & HELP CALLOUT (Moved into Learn page) */}
        <section className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-blue-500/10 border border-rose-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4" />
              <span>{language === 'hi' ? 'पीड़ित हैं या डीपफेक रिपोर्ट करना चाहते हैं?' : 'Targeted by a deepfake or online scam?'}</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {language === 'hi' 
                ? 'राष्ट्रीय साइबर अपराध हेल्पलाइन 1930 पर कॉल करें या cybercrime.gov.in पर शिकायत दर्ज करें।'
                : 'Call National Cyber Crime Helpline 1930 (India) or file an official report on cybercrime.gov.in.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToHelp}
              leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
              className="border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
            >
              {language === 'hi' ? 'पूरी रिपोर्टिंग गाइड देखें' : 'View Report & Help Guide'}
            </Button>
          </div>
        </section>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.learn.tabAll}
          </button>
          <button
            onClick={() => setActiveTab('tech')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tech'
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.learn.tabTech}
          </button>
          <button
            onClick={() => setActiveTab('spotting')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'spotting'
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.learn.tabSpotting}
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'articles'
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.learn.tabEthics}
          </button>
        </div>

        {/* SECTION 1: HOW DEEPFAKES WORK */}
        {(activeTab === 'all' || activeTab === 'tech') && (
          <section id="how-deepfakes-work" className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                <Brain className="w-4 h-4" />
                <span>{language === 'hi' ? 'तकनीकी कार्यप्रणाली' : 'Neural Mechanics'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {t.learn.howTheyWorkTitle}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t.learn.howTheyWorkDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {techCards.map((card) => (
                <Card key={card.id} variant="default" className="p-6 sm:p-7 space-y-4 hover:border-cyan-500/40 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {card.icon}
                    </div>
                    <span className="text-xs font-mono font-semibold uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400">
                      {card.id}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
                      {card.subtitle}
                    </p>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {card.description}
                  </p>

                  <div className="pt-3 border-t border-slate-200 dark:border-navy-800/80 space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                      {language === 'hi' ? 'फॉरेंसिक पहचान के बिंदु:' : 'Key Forensic Tell-Tales:'}
                    </span>
                    {card.indicators.map((ind, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className="text-cyan-500 mt-0.5">•</span>
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: 8 TIPS TO SPOT DEEPFAKES */}
        {(activeTab === 'all' || activeTab === 'spotting') && (
          <section id="tips-to-spot" className="space-y-6 pt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Eye className="w-4 h-4" />
                <span>{language === 'hi' ? 'पहचान के सूत्र' : 'Visual & Auditory Guide'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {t.learn.spotTipsTitle}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t.learn.spotTipsDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {spottingTips.map((tip) => (
                <Card key={tip.number} variant="glass" className="p-5 space-y-3 hover:border-emerald-500/40 transition-all group flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-extrabold font-mono text-emerald-500/40 group-hover:text-emerald-500 transition-colors">
                        {tip.number}
                      </span>
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                        {tip.icon}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {tip.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {tip.desc}
                    </p>
                  </div>

                  <div className="pt-2 text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'सत्यापन योग्य संकेत' : 'Forensically testable'}</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3: AWARENESS ARTICLES & CASE STUDIES */}
        {(activeTab === 'all' || activeTab === 'articles') && (
          <section id="awareness-articles" className="space-y-6 pt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <FileText className="w-4 h-4" />
                <span>{language === 'hi' ? 'विस्तृत अध्ययन और सुरक्षा' : 'Investigative Briefings'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {t.learn.articlesTitle}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {language === 'hi'
                  ? 'डीपफेक घोटालों, लोकतांत्रिक अखंडता और कानूनी अधिकारों पर आधारित व्यावहारिक ज्ञान।'
                  : 'Real-world case briefings covering financial fraud prevention, democratic resilience, and legal protection.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((art) => (
                <Card
                  key={art.id}
                  variant="default"
                  className="p-6 space-y-4 hover:border-blue-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                        {art.category}
                      </span>
                      <span>{art.readTime} {t.learn.readTime}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {art.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-navy-800/80">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedArticleId(selectedArticleId === art.id ? null : art.id)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      className="w-full justify-between"
                    >
                      {selectedArticleId === art.id 
                        ? (language === 'hi' ? 'संक्षिप्त करें' : 'Collapse') 
                        : (language === 'hi' ? 'पूरा लेख पढ़ें' : 'Read Full Briefing')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Expanded Article Modal / Drawer */}
            {selectedArticleId && (() => {
              const art = articles.find((a) => a.id === selectedArticleId);
              if (!art) return null;
              return (
                <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-navy-900 border border-blue-500/40 shadow-xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-blue-600 dark:text-blue-400">
                      {art.category} • {art.date}
                    </span>
                    <button
                      onClick={() => setSelectedArticleId(null)}
                      className="text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer px-2 py-1 rounded bg-slate-100 dark:bg-navy-800"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    {art.title}
                  </h3>
                  <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {art.content}
                  </div>
                </div>
              );
            })()}
          </section>
        )}

        {/* BOTTOM PROTOCOL CHECKLIST CALLOUT */}
        <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-teal-500/10 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-600 dark:text-cyan-400">
              <Lightbulb className="w-4 h-4" />
              <span>{t.learn.interactiveQuizTitle}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {language === 'hi' 
                ? 'वायरल वीडियो या ऑडियो साझा करने से पहले "STOP & CHECK" नियम अपनाएं' 
                : 'Before sharing emotional media, adopt the "STOP & VERIFY" habit'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {language === 'hi'
                ? '1. रुकें (Stop) • 2. स्रोत खोजें (Source) • 3. फॉरेंसिक टेस्ट करें (TruthLens Scan) • 4. आधिकारिक पुष्टि के बाद ही आगे भेजें।'
                : '1. Pause emotional reaction • 2. Check source integrity • 3. Run TruthLens neural forensic scan • 4. Only forward with verified provenance.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={onNavigateToScanner}
              leftIcon={<Scan className="w-4 h-4" />}
            >
              {language === 'hi' ? 'संदेहास्पद मीडिया स्कैन करें' : 'Scan Suspect Media'}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onNavigateToHelp}
              leftIcon={<ShieldAlert className="w-4 h-4 text-rose-500" />}
            >
              {language === 'hi' ? 'साइबर हेल्पलाइन 1930' : 'Report Abuse & 1930'}
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
