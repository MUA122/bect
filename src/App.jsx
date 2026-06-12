import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  Drawer,
  Fade,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import ArrowOutwardRounded from '@mui/icons-material/ArrowOutwardRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import LanguageRounded from '@mui/icons-material/LanguageRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import SendRounded from '@mui/icons-material/SendRounded';
import ServicesSection from './components/ServicesSection';
import ExpertisePage from './components/ExpertisePage';
import ProjectsPage from './components/ProjectsPage';
import ExperienceTimeline from './components/ExperienceTimeline';
import LeadershipSection from './components/LeadershipSection';
import CertificationsSection from './components/CertificationsSection';
import GlobalPresenceSection from './components/GlobalPresenceSection';
import SiteFooter from './components/SiteFooter';
import halfMoonImage from './assets/projects/half-moon.png';
import helioImage from './assets/projects/helio.jpg';
import metroImage from './assets/projects/metro.jpg';
import schneiderImage from './assets/projects/schneider.jpeg';
import utopiaImage from './assets/projects/utopia.jpeg';
import wadiDayqahImage from './assets/projects/wadi-dayqah.jpeg';

// Paste your deployed Google Apps Script web app URL here.
const GOOGLE_SHEETS_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbzm0W8QlkWbNqhBwuE2VCDoeGMsri4R0EHawp3OGX0d3NZeOXcoH51_kjGEk7DXD2u0/exec';

const impactStats = [
  { value: 300, suffix: '+', label: { en: 'Employees', ar: 'موظفًا' } },
  { value: 800, suffix: '+', label: { en: 'Projects Delivered', ar: 'مشروعًا تم تسليمه' } },
  { value: 35, suffix: '+', label: { en: 'Years of Experience', ar: 'عامًا من الخبرة' } },
  { value: 10, prefix: '$', suffix: 'B+', label: { en: 'Construction Value', ar: 'قيمة إنشائية' } },
  { value: 2, label: { en: 'International Offices', ar: 'مكتبان دوليان' } },
];

const slides = [
  {
    title: { en: 'Half Moon Bay', ar: 'خليج نصف القمر' },
    category: { en: 'Urban Development', ar: 'التطوير العمراني' },
    image: halfMoonImage,
  },
  {
    title: { en: 'Helio Gate', ar: 'هيليو جيت' },
    category: { en: 'Architecture & Design', ar: 'العمارة والتصميم' },
    image: helioImage,
  },
  {
    title: { en: 'Wadi Dayqah', ar: 'وادي ضيقة' },
    category: { en: 'Infrastructure', ar: 'البنية التحتية' },
    image: wadiDayqahImage,
  },
  {
    title: { en: 'Schneider Factory', ar: 'مصنع شنايدر' },
    category: { en: 'Industrial', ar: 'الصناعة' },
    image: schneiderImage,
  },
  {
    title: { en: 'Utopia Pharmaceuticals', ar: 'يوتوبيا للأدوية' },
    category: { en: 'Industrial', ar: 'الصناعة' },
    image: utopiaImage,
  },
  {
    title: { en: 'Metro Lines', ar: 'خطوط المترو' },
    category: { en: 'Transportation', ar: 'النقل والمواصلات' },
    image: metroImage,
  },
];

const menuData = {
  en: [
    {
      label: 'Home',
      groups: [],
    },
    {
      label: 'Expertise',
      groups: [
        { title: 'Sectors', items: ['Urban Development', 'Industrial', 'Residential', 'Office Buildings & Commercial', 'Educational & Healthcare', 'Transportation & Infrastructure'] },
        { title: 'Services', items: ['Architecture & Interior Design', 'Civil & Structural Design', 'Landscape Design', 'Urban Design & Planning', 'MEP & Firefighting', 'Project Management & Site Supervision'] },
      ],
    },
    {
      label: 'Projects',
      groups: [
        { title: 'Regions', items: ['Egypt', 'Africa', 'Middle East', 'North Africa', 'Europe'] },
        { title: 'Sectors', items: ['Urban Development', 'Industrial', 'Residential', 'Office Buildings & Commercial', 'Educational & Healthcare', 'Transportation & Infrastructure'] },
        { title: 'Services', items: ['Architecture & Interior Design', 'Civil & Structural Design', 'Landscape Design', 'Urban Design & Planning', 'MEP & Firefighting', 'Project Management & Site Supervision'] },
      ],
    },
    {
      label: 'About Us',
      groups: [
        { title: 'Company', items: ['Our story', 'Leadership', 'Our approach'] },
        { title: 'Recognition', items: ['Awards', 'Board'] },
      ],
    },
    { label: 'Contact Us', groups: [] },
  ],
  ar: [
    {
      label: 'الرئيسية',
      groups: [],
    },
    {
      label: 'خبراتنا',
      groups: [
        { title: 'القطاعات', items: ['التطوير العمراني', 'الصناعة', 'السكني', 'المباني الإدارية والتجارية', 'التعليم والرعاية الصحية', 'النقل والبنية التحتية'] },
        { title: 'الخدمات', items: ['العمارة والتصميم الداخلي', 'التصميم المدني والإنشائي', 'تصميم المناظر الطبيعية', 'التصميم والتخطيط العمراني', 'الأعمال الكهروميكانيكية ومكافحة الحريق', 'إدارة المشروعات والإشراف على المواقع'] },
      ],
    },
    {
      label: 'مشاريعنا',
      groups: [
        { title: 'المناطق', items: ['مصر', 'أفريقيا', 'الشرق الأوسط', 'شمال أفريقيا', 'أوروبا'] },
        { title: 'القطاعات', items: ['التطوير العمراني', 'الصناعة', 'السكني', 'المباني الإدارية والتجارية', 'التعليم والرعاية الصحية', 'النقل والبنية التحتية'] },
        { title: 'الخدمات', items: ['العمارة والتصميم الداخلي', 'التصميم المدني والإنشائي', 'تصميم المناظر الطبيعية', 'التصميم والتخطيط العمراني', 'الأعمال الكهروميكانيكية ومكافحة الحريق', 'إدارة المشروعات والإشراف على المواقع'] },
      ],
    },
    {
      label: 'من نحن',
      groups: [
        { title: 'الشركة', items: ['قصتنا', 'فريق القيادة', 'منهجنا'] },
        { title: 'التقدير', items: ['الجوائز', 'مجلس الإدارة'] },
      ],
    },
    { label: 'تواصل معنا', groups: [] },
  ],
};

const copy = {
  en: {
    kicker: 'Architects & Engineers',
    impact: '35+ years of impact',
    headline: 'Expertise you can trust.',
    subhead: 'Solutions that empower you.',
    body: 'We shape places, systems and infrastructure that move communities forward.',
    explore: 'Explore project',
    contact: 'Start a conversation',
    selected: 'Selected work',
    projects: 'Projects delivered',
    countries: 'Countries',
    menu: 'Menu',
    loading: ['Shaping places with purpose', 'Engineering progress', 'Designing what comes next'],
    form: {
      eyebrow: 'Start a project',
      title: 'Let’s shape what comes next.',
      intro: 'Tell us a little about your project. Our team will get back to you shortly.',
      name: 'Full name',
      email: 'Work email',
      phone: 'Phone number',
      company: 'Company',
      interest: 'How can we help?',
      interests: ['Architecture & design', 'Engineering consultancy', 'Project management', 'Urban planning', 'Other'],
      message: 'Tell us about your project',
      submit: 'Send enquiry',
      sending: 'Sending...',
      success: 'Thank you. Your enquiry has been received.',
      error: 'We could not send your enquiry. Please try again.',
      endpoint: 'Google Sheets connection is ready. Add your Apps Script URL to GOOGLE_SHEETS_ENDPOINT.',
      close: 'Close contact form',
    },
  },
  ar: {
    kicker: 'معماريون ومهندسون',
    impact: 'أكثر من 35 عامًا من التأثير',
    headline: 'خبرة تستحق ثقتك.',
    subhead: 'حلول تمكّنك من التقدم.',
    body: 'نصمم الأماكن والأنظمة والبنية التحتية التي تدفع المجتمعات نحو المستقبل.',
    explore: 'استكشف المشروع',
    contact: 'ابدأ محادثة',
    selected: 'أعمال مختارة',
    projects: 'مشروعًا تم تسليمه',
    countries: 'دولة',
    menu: 'القائمة',
    loading: ['نصنع أماكن ذات معنى', 'نهندس مسارات التقدم', 'نصمم ملامح المستقبل'],
    form: {
      eyebrow: 'ابدأ مشروعًا',
      title: 'لنصنع معًا ملامح المستقبل.',
      intro: 'شاركنا نبذة عن مشروعك، وسيتواصل معك فريقنا في أقرب وقت.',
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني للعمل',
      phone: 'رقم الهاتف',
      company: 'الشركة',
      interest: 'كيف يمكننا مساعدتك؟',
      interests: ['العمارة والتصميم', 'الاستشارات الهندسية', 'إدارة المشروعات', 'التخطيط العمراني', 'أخرى'],
      message: 'حدثنا عن مشروعك',
      submit: 'إرسال الطلب',
      sending: 'جارٍ الإرسال...',
      success: 'شكرًا لك. تم استلام طلبك بنجاح.',
      error: 'تعذر إرسال طلبك. يرجى المحاولة مرة أخرى.',
      endpoint: 'النموذج جاهز للربط. أضف رابط Google Apps Script في GOOGLE_SHEETS_ENDPOINT.',
      close: 'إغلاق نموذج التواصل',
    },
  },
};

function Logo({ light = false, compact = false }) {
  const color = light ? '#fff' : '#005b8f';
  return (
    <Stack direction="row" alignItems="center" spacing={1.15} sx={{ color }}>
      <Box>
        <Typography sx={{ fontSize: compact ? 25 : 29, lineHeight: 0.86, fontWeight: 800, letterSpacing: '-1.7px' }}>BECT</Typography>
        <Typography sx={{ fontSize: compact ? 4.7 : 5.3, lineHeight: 1.4, fontWeight: 800, letterSpacing: '.07em' }}>ARCHITECTS &amp; ENGINEERS</Typography>
      </Box>
      {!compact && (
        <>
          <Box sx={{ width: '1px', height: 35, bgcolor: light ? 'rgba(255,255,255,.3)' : 'rgba(0,91,143,.22)' }} />
          <Typography sx={{ fontSize: 11, lineHeight: 1.15, fontWeight: 700, maxWidth: 64 }}>35+ Years<br />Of Impact</Typography>
        </>
      )}
    </Stack>
  );
}

function LoadingScreen({ visible, language, progress, compact = false }) {
  const [phrase, setPhrase] = useState(0);
  useEffect(() => {
    if (!visible) return undefined;
    const timer = window.setInterval(() => setPhrase((current) => (current + 1) % copy[language].loading.length), 900);
    return () => window.clearInterval(timer);
  }, [language, visible]);

  return (
    <Fade in={visible} timeout={{ enter: 0, exit: 700 }} unmountOnExit>
      <Box className={`loading-screen ${compact ? 'is-transition' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Box className="loader-orbit"><Box className="loader-logo"><Logo light compact /></Box></Box>
        <Box sx={{ width: 'min(78vw, 430px)', textAlign: 'center' }}>
          <Typography key={`${language}-${phrase}`} className="loading-phrase">{copy[language].loading[phrase]}</Typography>
          <Box className="loading-track"><Box sx={{ width: `${progress}%` }} /></Box>
          <Typography className="loading-percent">{String(progress).padStart(2, '0')}%</Typography>
        </Box>
      </Box>
    </Fade>
  );
}

function AnimatedNumber({ active, value, prefix = '', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    const duration = 1300;
    const startTime = performance.now();
    let animationFrame;

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.round(value * eased));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [active, value]);

  return <>{prefix}{displayValue}{suffix}</>;
}

function ImpactSection({ language }) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <Box component="section" ref={sectionRef} className={`impact-section ${visible ? 'is-visible' : ''}`}>
      <Box className="impact-grid-lines" aria-hidden="true" />
      <Container maxWidth="xl" className="impact-container">
        {impactStats.map((stat, index) => (
          <Box key={stat.label.en} className="impact-stat" sx={{ '--stat-index': index }}>
            <Typography className="impact-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</Typography>
            <Box className="impact-number-wrap">
              <Typography className="impact-number">
                <AnimatedNumber active={visible} value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </Typography>
              <Box className="impact-pulse" aria-hidden="true" />
            </Box>
            <Typography className="impact-stat-label">{stat.label[language]}</Typography>
          </Box>
        ))}
      </Container>
      <Box className="impact-runner" aria-hidden="true" />
    </Box>
  );
}

function App() {
  const [language, setLanguage] = useState('en');
  const [currentPage, setCurrentPage] = useState(
    () => {
      if (window.location.hash.startsWith('#expertise')) return 'expertise';
      if (window.location.hash.startsWith('#projects')) return 'projects';
      return 'home';
    },
  );
  const [active, setActive] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState(0);
  const [firstImageReady, setFirstImageReady] = useState(false);
  const [minimumTimePassed, setMinimumTimePassed] = useState(false);
  const [initialLoadReleased, setInitialLoadReleased] = useState(false);
  const [pageTransitioning, setPageTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [formStatus, setFormStatus] = useState('idle');
  const transitionTimer = useRef(null);
  const transitionProgressTimer = useRef(null);
  const currentPageRef = useRef(currentPage);
  const isArabic = language === 'ar';
  const text = copy[language];
  const nav = menuData[language];
  const slide = slides[active];
  const initialLoading = !initialLoadReleased;
  const loading = initialLoading || pageTransitioning;
  const progress = pageTransitioning
    ? transitionProgress
    : firstImageReady && minimumTimePassed
      ? 100
      : Math.min(92, 18 + Math.round((loadedImages / slides.length) * 68));

  useEffect(() => {
    const syncPage = () => {
      const hash = window.location.hash;
      const nextPage = hash.startsWith('#expertise')
        ? 'expertise'
        : hash.startsWith('#projects')
          ? 'projects'
          : 'home';

      if (nextPage === currentPageRef.current) return;

      window.clearTimeout(transitionTimer.current);
      window.clearTimeout(transitionProgressTimer.current);
      setMenuOpen(false);
      setPageTransitioning(true);
      setTransitionProgress(18);

      transitionProgressTimer.current = window.setTimeout(() => {
        setTransitionProgress(82);
      }, 70);

      transitionTimer.current = window.setTimeout(() => {
        currentPageRef.current = nextPage;
        setCurrentPage(nextPage);
        window.scrollTo({ top: 0, behavior: 'auto' });
        setTransitionProgress(100);

        transitionTimer.current = window.setTimeout(() => {
          setPageTransitioning(false);
          setTransitionProgress(0);
        }, 140);
      }, 170);
    };

    window.addEventListener('hashchange', syncPage);
    return () => {
      window.removeEventListener('hashchange', syncPage);
      window.clearTimeout(transitionTimer.current);
      window.clearTimeout(transitionProgressTimer.current);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  }, [language, isArabic]);

  useEffect(() => {
    const minimumTimer = window.setTimeout(() => setMinimumTimePassed(true), 450);
    const releaseTimer = window.setTimeout(() => setInitialLoadReleased(true), 1400);

    slides.forEach(({ image }, index) => {
      const img = new Image();
      let settled = false;
      img.onload = img.onerror = () => {
        if (settled) return;
        settled = true;
        setLoadedImages((count) => Math.min(slides.length, count + 1));
        if (index === 0) setFirstImageReady(true);
      };
      img.src = image;
    });
    return () => {
      window.clearTimeout(minimumTimer);
      window.clearTimeout(releaseTimer);
    };
  }, []);

  useEffect(() => {
    if (!minimumTimePassed || !firstImageReady) return undefined;
    const releaseTimer = window.setTimeout(() => setInitialLoadReleased(true), 120);
    return () => window.clearTimeout(releaseTimer);
  }, [firstImageReady, minimumTimePassed]);

  useEffect(() => {
    if (loading) return undefined;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [loading]);

  const links = useMemo(
    () => nav.map((item, index) => ({
      ...item,
      href: index === 0 ? '#home' : `#${['home', 'expertise', 'projects', 'about', 'contact'][index]}`,
    })),
    [nav],
  );

  const changeSlide = (direction) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!GOOGLE_SHEETS_ENDPOINT) {
      setFormStatus('endpoint');
      return;
    }

    setFormStatus('sending');
    const formData = new FormData(form);
    formData.append('language', language);
    formData.append('formName', 'Website contact form');
    formData.append('page', currentPage);
    formData.append('pageUrl', window.location.href);
    formData.append('submittedAt', new Date().toISOString());
    const payload = new URLSearchParams();
    formData.forEach((value, key) => payload.append(key, String(value)));

    try {
      await fetch(GOOGLE_SHEETS_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        body: payload,
      });
      form.reset();
      setFormStatus('success');
    } catch {
      setFormStatus('error');
    }
  };

  return (
    <Box id={currentPage === 'home' ? 'home' : undefined} dir={isArabic ? 'rtl' : 'ltr'} sx={{ minHeight: '100svh', bgcolor: '#06273b' }}>
      <LoadingScreen
        visible={loading}
        language={language}
        progress={progress}
        compact={pageTransitioning && !initialLoading}
      />

      <AppBar
        elevation={0}
        position="fixed"
        color="transparent"
        sx={{ pt: { xs: 1.25, md: 2 }, zIndex: 1200, pointerEvents: loading ? 'none' : 'auto' }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative' }}>
          <Toolbar className="glass-header" disableGutters>
            <Box component="a" href="#home" aria-label="BECT home" sx={{ textDecoration: 'none', flexShrink: 0 }}><Logo compact={false} /></Box>

            <Stack component="nav" direction="row" className="desktop-nav" sx={{ mx: 'auto', display: { xs: 'none', md: 'flex' } }}>
              {links.map((item, index) => (
                <Button
                  key={item.label}
                  href={item.href}
                  sx={{
                    color: (currentPage === 'expertise' ? index === 1 : currentPage === 'projects' ? index === 2 : index === 0) ? '#00639a' : '#183447',
                    minWidth: 0,
                    px: 0.5,
                    fontSize: { md: 12, lg: 13 },
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>

            <Stack direction="row" className="header-actions" alignItems="center" sx={{ ml: isArabic ? 0 : 'auto', mr: isArabic ? 'auto' : 0 }}>
              <Button onClick={() => setLanguage(isArabic ? 'en' : 'ar')} startIcon={<LanguageRounded />} className="language-button">
                {isArabic ? 'EN' : 'العربية'}
              </Button>
              <IconButton aria-label={text.menu} onClick={() => setMenuOpen(true)} sx={{ display: { md: 'none' }, color: '#173346' }}><MenuRounded /></IconButton>
            </Stack>
          </Toolbar>

        </Container>
      </AppBar>

      {currentPage === 'expertise' ? (
        <>
          <ExpertisePage
            language={language}
            onContactClick={() => {
              setFormStatus('idle');
              setContactOpen(true);
            }}
          />
          <SiteFooter
            language={language}
            onContactClick={() => {
              setFormStatus('idle');
              setContactOpen(true);
            }}
          />
        </>
      ) : currentPage === 'projects' ? (
        <>
          <ProjectsPage
            language={language}
            onContactClick={() => {
              setFormStatus('idle');
              setContactOpen(true);
            }}
          />
          <SiteFooter
            language={language}
            onContactClick={() => {
              setFormStatus('idle');
              setContactOpen(true);
            }}
          />
        </>
      ) : (
        <>
      <Box component="main" className="hero">
        {slides.map((item, index) => (
          <Box
            key={item.image}
            className="hero-image"
            sx={{
              backgroundImage: `url("${item.image}")`,
              opacity: active === index ? 1 : 0,
              transform: active === index ? 'scale(1.02)' : 'scale(1.08)',
            }}
          />
        ))}
        <Box className={`hero-shade ${isArabic ? 'rtl' : ''}`} />
        <Box className="hero-bottom-shade" />

        <Container maxWidth="xl" className="hero-layout">
          <Box className="hero-copy">
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: { xs: 2, md: 2.5 } }}>
              <Box sx={{ width: 34, height: 2, bgcolor: 'secondary.main', flexShrink: 0 }} />
              <Typography className="impact-label">{text.impact}</Typography>
            </Stack>
            <Typography component="h1" className={`hero-title ${isArabic ? 'arabic' : ''}`}>
              {text.headline}
              <Box component="span">{text.subhead}</Box>
            </Typography>
            <Typography className="hero-body">{text.body}</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} className="hero-actions">
              <Button variant="contained" size="large" endIcon={<ArrowOutwardRounded />} className="primary-cta">{text.explore}</Button>
              <Button variant="outlined" size="large" className="secondary-cta" onClick={() => { setFormStatus('idle'); setContactOpen(true); }}>{text.contact}</Button>
            </Stack>
          </Box>

          <Box className="project-bar">
            <Box sx={{ color: 'white', minWidth: 0 }}>
              <Typography className="selected-label">{text.selected} · {String(active + 1).padStart(2, '0')}</Typography>
              <Typography className="project-title">{slide.title[language]}</Typography>
              <Typography className="project-category">{slide.category[language]}</Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <IconButton onClick={() => changeSlide(-1)} aria-label="Previous project" sx={controlSx}>
                {isArabic ? <ArrowForwardRounded /> : <ArrowBackRounded />}
              </IconButton>
              <IconButton onClick={() => changeSlide(1)} aria-label="Next project" sx={{ ...controlSx, bgcolor: '#fff', color: '#07324a', '&:hover': { bgcolor: '#dff3fa' } }}>
                {isArabic ? <ArrowBackRounded /> : <ArrowForwardRounded />}
              </IconButton>
            </Stack>
          </Box>
        </Container>

        <Stack direction="row" className={`side-stats ${isArabic ? 'rtl' : ''}`}>
          <Typography>800+ {text.projects}</Typography>
          <Box />
          <Typography>16 {text.countries}</Typography>
        </Stack>
      </Box>

      <ImpactSection language={language} />
      <ServicesSection language={language} />
      <ExperienceTimeline language={language} />
      <LeadershipSection language={language} />
      <CertificationsSection language={language} />
      <GlobalPresenceSection language={language} />
      <SiteFooter
        language={language}
        onContactClick={() => {
          setFormStatus('idle');
          setContactOpen(true);
        }}
      />
        </>
      )}

      <Drawer
        anchor={isArabic ? 'left' : 'right'}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{ sx: { width: 'min(92vw, 420px)', bgcolor: '#062a40', color: 'white', p: { xs: 2.5, sm: 3.5 } } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Logo light />
          <IconButton onClick={() => setMenuOpen(false)} sx={{ color: 'white' }}><CloseRounded /></IconButton>
        </Stack>
        <Stack component="nav" sx={{ mt: 5 }}>
          {links.map((item, index) => (
            <Button key={item.label} href={item.href} onClick={() => setMenuOpen(false)} sx={{ justifyContent: 'space-between', color: 'white', fontSize: 21, py: 2, borderBottom: '1px solid rgba(255,255,255,.12)' }}>
              {item.label}<Typography sx={{ color: 'rgba(255,255,255,.35)', fontSize: 10 }}>0{index + 1}</Typography>
            </Button>
          ))}
        </Stack>
        <Typography sx={{ mt: 'auto', pt: 4, color: 'rgba(255,255,255,.5)', fontSize: 12 }}>{text.kicker}</Typography>
      </Drawer>

      <Dialog
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        fullWidth
        maxWidth="md"
        dir={isArabic ? 'rtl' : 'ltr'}
        className="contact-dialog"
        PaperProps={{ className: 'contact-paper' }}
      >
        <IconButton aria-label={text.form.close} onClick={() => setContactOpen(false)} className="contact-close">
          <CloseRounded />
        </IconButton>
        <DialogContent className="contact-content">
          <Box className="contact-brand">
            <Logo light />
            <Box className="contact-brand-copy">
              <Typography className="contact-eyebrow">{text.form.eyebrow}</Typography>
              <Typography component="h2" className="contact-title">{text.form.title}</Typography>
              <Typography className="contact-intro">{text.form.intro}</Typography>
            </Box>
            <Typography className="contact-mark">35<span>+</span></Typography>
          </Box>

          <Box component="form" className="contact-form" onSubmit={handleContactSubmit}>
            <Box className="contact-fields">
              <TextField name="name" label={text.form.name} required fullWidth />
              <TextField name="email" label={text.form.email} type="email" required fullWidth />
              <TextField name="phone" label={text.form.phone} type="tel" fullWidth />
              <TextField name="company" label={text.form.company} fullWidth />
              <TextField name="interest" label={text.form.interest} select required fullWidth defaultValue="">
                {text.form.interests.map((interest) => <MenuItem key={interest} value={interest}>{interest}</MenuItem>)}
              </TextField>
              <TextField name="message" label={text.form.message} required multiline minRows={4} fullWidth className="message-field" />
            </Box>

            {formStatus !== 'idle' && formStatus !== 'sending' && (
              <Typography className={`form-notice ${formStatus}`}>
                {text.form[formStatus]}
              </Typography>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} className="form-footer">
              <Typography>{text.kicker} · Cairo, Egypt</Typography>
              <Button
                type="submit"
                variant="contained"
                endIcon={<SendRounded />}
                disabled={formStatus === 'sending'}
                className="form-submit"
              >
                {formStatus === 'sending' ? text.form.sending : text.form.submit}
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

const controlSx = {
  width: { xs: 43, md: 50 },
  height: { xs: 43, md: 50 },
  color: 'white',
  border: '1px solid rgba(255,255,255,.34)',
  backdropFilter: 'blur(12px)',
  '&:hover': { bgcolor: 'rgba(255,255,255,.14)' },
};

export default App;
