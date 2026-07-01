import React, { useRef, useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import './ExpertisePage.css';
import halfMoonImage from '../assets/projects/half-moon.png';
import helioImage from '../assets/projects/helio.jpg';
import metroImage from '../assets/projects/metro.jpg';
import schneiderImage from '../assets/projects/schneider.jpeg';
import schneiderMepImage from '../assets/projects/schneider-mep-main.jpg';
import utopiaImage from '../assets/projects/utopia.jpeg';
import wadiDayqahImage from '../assets/projects/wadi-dayqah.jpeg';

const services = [
  {
    title: { en: 'Architecture', ar: 'العمارة' },
    description: {
      en: 'Focuses on serving the community as well as providing an unforgettable experience. We live in spaces that should accommodate and serve our needs. A good design responds to its users while providing them with a rich experience.',
      ar: 'نركز على خدمة المجتمع وصناعة تجربة لا تنسى. نصمم مساحات تستوعب احتياجات مستخدميها وتخدمهم، وتستجيب لهم مع تقديم تجربة مكانية غنية وملهمة.',
    },
    image: '/projects/profile/26-cairo-historic-panorama.jpg',
    code: 'AR',
  },
  {
    title: { en: 'Landscape', ar: 'تصميم المناظر الطبيعية' },
    description: {
      en: 'Outdoor arrangement and design is at the heart of many projects, allowing for social interactions. BECT landscape designs balance aesthetic character with functional purpose.',
      ar: 'يشكل تنظيم وتصميم المساحات الخارجية قلب العديد من المشروعات، ويتيح التفاعل الاجتماعي. توازن تصاميمنا بين الطابع الجمالي والهدف الوظيفي.',
    },
    image: '/projects/profile/40-People-Square.png',
    code: 'LD',
  },
  {
    title: { en: 'Planning & Urban Design', ar: 'التخطيط والتصميم العمراني' },
    description: {
      en: 'Focuses on building a solid urban fabric with no futuristic restrictions to development and expansion. Our experience spans metropolitan and regional development, master planning and major urban upgrades.',
      ar: 'نبني نسيجًا عمرانيًا متماسكًا يتيح التطور والتوسع مستقبلًا. تمتد خبرتنا عبر التنمية الحضرية والإقليمية والمخططات العامة ومشروعات الارتقاء العمراني الكبرى.',
    },
    image: '/projects/profile/14-al-mukaymen-city.jpg',
    code: 'UP',
  },
  {
    title: { en: 'Structure', ar: 'التصميم الإنشائي' },
    description: {
      en: 'Ensures the safety and endurance of the design while supporting architecture to reach its best outcome. Our team is well acquainted with structural building types of varying complexity.',
      ar: 'نضمن سلامة التصميم واستدامته، وندعم الرؤية المعمارية للوصول إلى أفضل نتائجها. يمتلك فريقنا خبرة واسعة في الأنظمة الإنشائية بمختلف درجات تعقيدها.',
    },
    image: '/projects/profile/27-coc2-center-of-excellence.jpg',
    code: 'ST',
  },
  {
    title: { en: 'Project Management & Supervision', ar: 'إدارة المشروعات والإشراف' },
    description: {
      en: 'Following up between the design team and site supervision team is crucial to attain optimum time, cost and quality performance.',
      ar: 'يعد التنسيق المستمر بين فريق التصميم وفريق الإشراف بالموقع ضروريًا لتحقيق أفضل أداء ممكن من حيث الوقت والتكلفة والجودة.',
    },
    image: '/projects/profile/15-state-security-headquarters.jpg',
    code: 'PM',
  },
  {
    title: { en: 'Civil', ar: 'الهندسة المدنية' },
    description: {
      en: 'Covers a variety of projects including roads, bridges, buildings, airports, tunnels, dams, irrigation systems, and water and wastewater networks.',
      ar: 'تشمل خبراتنا مجموعة واسعة من المشروعات، منها الطرق والجسور والمباني والمطارات والأنفاق والسدود وشبكات الري والمياه والصرف الصحي.',
    },
    image: '/projects/profile/91-port-said-tunnels.jpg',
    code: 'CE',
  },
  {
    title: { en: 'MEP', ar: 'الأعمال الكهروميكانيكية' },
    description: {
      en: 'The services associated with creating a safe and comfortable environment, covering HVAC, plumbing, lighting, firefighting, fire alarm, water supply, sanitation and more.',
      ar: 'خدمات متكاملة لصناعة بيئة آمنة ومريحة، تشمل التكييف والسباكة والإضاءة ومكافحة وإنذار الحريق وإمدادات المياه والصرف الصحي وغيرها.',
    },
    image: schneiderMepImage,
    code: 'ME',
  },
];

const sectors = [
  {
    title: { en: 'Urban Development', ar: 'التطوير العمراني' },
    description: {
      en: 'We turn ambitious development visions into connected, resilient places. From city-scale frameworks to waterfront destinations, our work aligns infrastructure, mobility, landscape and identity around everyday human experience.',
      ar: 'نحول رؤى التنمية الطموحة إلى أماكن مترابطة وقادرة على الاستدامة، من المخططات العمرانية واسعة النطاق إلى الوجهات الساحلية، مع دمج البنية التحتية والحركة والهوية حول تجربة الإنسان.',
    },
    image: halfMoonImage,
    code: 'UD',
  },
  {
    title: { en: 'Industrial', ar: 'الصناعي' },
    description: {
      en: 'High-performance facilities demand precision. We coordinate process, people, utilities and future expansion to create efficient industrial environments that support production without compromising safety or adaptability.',
      ar: 'تتطلب المنشآت عالية الأداء دقة استثنائية. ننسق العمليات والأفراد والمرافق والتوسع المستقبلي لصناعة بيئات صناعية فعالة تدعم الإنتاج دون المساس بالسلامة أو المرونة.',
    },
    image: schneiderImage,
    code: 'IN',
  },
  {
    title: { en: 'Residential', ar: 'السكني' },
    description: {
      en: 'Our residential work begins with quality of life. We shape private and shared spaces around comfort, belonging, climate and long-term value, creating communities that feel distinctive and genuinely livable.',
      ar: 'تبدأ مشروعاتنا السكنية من جودة الحياة. نصمم المساحات الخاصة والمشتركة حول الراحة والانتماء والمناخ والقيمة طويلة الأمد، لنصنع مجتمعات مميزة وصالحة للحياة.',
    },
    image: helioImage,
    code: 'RE',
  },
  {
    title: { en: 'Office Buildings & Commercial', ar: 'المباني الإدارية والتجارية' },
    description: {
      en: 'Flexible workplaces and commercial destinations should attract people and evolve with them. We combine brand expression, operational clarity and memorable public experience to create assets that remain relevant.',
      ar: 'يجب أن تجذب أماكن العمل والوجهات التجارية المرنة الناس وتتطور معهم. ندمج هوية العلامة وكفاءة التشغيل والتجربة العامة المميزة لصناعة أصول تحافظ على قيمتها.',
    },
    image: utopiaImage,
    code: 'OC',
  },
  {
    title: { en: 'Educational & Healthcare', ar: 'التعليمي والرعاية الصحية' },
    description: {
      en: 'Environments for learning and care carry a profound responsibility. Our approach prioritizes dignity, accessibility, wellbeing and intuitive movement while meeting demanding technical and operational standards.',
      ar: 'تحمل بيئات التعلم والرعاية مسؤولية كبيرة. نعطي الأولوية للكرامة وسهولة الوصول والرفاهية والحركة الواضحة مع تحقيق المتطلبات التقنية والتشغيلية الدقيقة.',
    },
    image: helioImage,
    code: 'EH',
  },
  {
    title: { en: 'Transportation & Infrastructure', ar: 'النقل والبنية التحتية' },
    description: {
      en: 'Infrastructure becomes meaningful when it improves daily life. We design integrated transport and utility systems that move people, resources and cities forward with resilience, clarity and measurable impact.',
      ar: 'تصبح البنية التحتية ذات معنى عندما تحسن الحياة اليومية. نصمم أنظمة نقل ومرافق متكاملة تحرك الناس والموارد والمدن إلى الأمام بمرونة ووضوح وتأثير ملموس.',
    },
    image: metroImage,
    code: 'TI',
  },
];

const copy = {
  en: {
    eyebrow: 'BECT expertise',
    heroTitle: 'Ideas engineered into',
    heroAccent: 'places that endure.',
    intro: 'Explore the disciplines we bring together and the sectors where that expertise creates lasting value.',
    explore: 'Explore our expertise',
    services: 'Services',
    sectors: 'Sectors',
    serviceLabel: 'What we do',
    sectorLabel: 'Where we work',
    select: 'Select to explore',
    previous: 'Previous',
    next: 'Next',
    contact: 'Start a project',
  },
  ar: {
    eyebrow: 'خبرات BECT',
    heroTitle: 'أفكار نهندسها لتصبح',
    heroAccent: 'أماكن تدوم.',
    intro: 'استكشف التخصصات التي نجمعها والقطاعات التي تصنع فيها خبراتنا قيمة مستدامة.',
    explore: 'استكشف خبراتنا',
    services: 'الخدمات',
    sectors: 'القطاعات',
    serviceLabel: 'ماذا نقدم',
    sectorLabel: 'أين نعمل',
    select: 'اختر للاستكشاف',
    previous: 'السابق',
    next: 'التالي',
    contact: 'ابدأ مشروعًا',
  },
};

function ExpertiseIcon({ name, className = '' }) {
  const icons = {
    services: (
      <>
        <circle cx="12" cy="6" r="2.25" />
        <path d="M10.7 7.8 6.3 20M13.3 7.8 17.7 20M8.1 15h7.8M12 3V1.8" />
      </>
    ),
    sectors: (
      <>
        <path d="M3 20V9l6-3v14M9 20V3l6 3v14M15 20v-8l6-3v11M1.8 20h20.4" />
        <path d="M6 11h.01M6 15h.01M12 8h.01M12 12h.01M12 16h.01M18 14h.01M18 17h.01" />
      </>
    ),
    AR: <><circle cx="12" cy="6" r="2" /><path d="M10.8 7.7 6.5 20M13.2 7.7 17.5 20M8.4 15h7.2M12 4V2" /></>,
    LD: <><path d="M19.5 4.5C12 4 6.5 7.2 5 13.2c-.8 3.3 1.6 5.9 4.8 5.3 6.1-1.1 8.8-6.5 9.7-14Z" /><path d="M4 21c2.8-5.6 6.7-9.3 12.2-12" /></>,
    UP: <><path d="M3 20V10h5v10M8 20V5h6v15M14 20v-8h7v8M1.8 20h20.4" /><path d="M5.5 13h.01M5.5 16h.01M11 8h.01M11 12h.01M11 16h.01M17.5 15h.01" /></>,
    ST: <><path d="M3 20V8M21 20V8M3 10h18M5 20l7-10 7 10M8.2 15h7.6" /></>,
    PM: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2.5h6V4M8.5 10l1.7 1.7 3.2-3.4M8.5 16h7" /></>,
    CE: <><path d="M3 19h18M5 19c0-5 3.1-8 7-8s7 3 7 8M7 13V8M17 13V8M5 8h14" /></>,
    ME: <><path d="m13.5 2-7 11h5L10.5 22l7-12h-5l1-8Z" /></>,
    UD: <><path d="M3 20V9l5-3v14M8 20V4l7 3v13M15 20v-8l6-2v10M2 20h20" /></>,
    IN: <><path d="M3 20V9l7 4V9l7 4V6h4v14H3Z" /><path d="M6 17h.01M10 17h.01M14 17h.01M18 17h.01M18 6V3" /></>,
    RE: <><path d="m3 11 9-7 9 7v10H3V11Z" /><path d="M9 21v-7h6v7M7 10h.01M17 10h.01" /></>,
    OC: <><path d="M5 21V3h14v18M2 21h20" /><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3" /></>,
    EH: <><path d="M4 5.5h6c1.1 0 2 .9 2 2V20c0-1.7-1.3-3-3-3H4V5.5ZM20 5.5h-6c-1.1 0-2 .9-2 2V20c0-1.7 1.3-3 3-3h5V5.5Z" /><path d="M16 8v5M13.5 10.5h5" /></>,
    TI: <><path d="M8 22 11 2M16 22 13 2M5 22h14M10 8h4M9 14h6" /></>,
  };

  return (
    <svg
      className={`expertise-symbol ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name] || icons.services}
    </svg>
  );
}

function ExpertisePage({ language = 'en', onContactClick }) {
  const [mode, setMode] = useState('services');
  const [active, setActive] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const detailRef = useRef(null);
  const isArabic = language === 'ar';
  const text = copy[language];
  const items = mode === 'services' ? services : sectors;
  const item = items[active];

  const selectMode = (nextMode) => {
    setMode(nextMode);
    setActive(0);
    setDetailOpen(false);
  };

  const move = (direction) => {
    setActive((current) => (current + direction + items.length) % items.length);
  };

  const openItem = (index) => {
    setActive(index);
    setDetailOpen(true);
    window.setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  };

  return (
    <Box component="main" className="expertise-page" dir={isArabic ? 'rtl' : 'ltr'}>
      <Box className="expertise-hero">
        <Container maxWidth="xl" className="expertise-page-shell">
          <Box className="expertise-hero-layout">
            <Box className="expertise-hero-copy">
              <Typography className="expertise-page-eyebrow">{text.eyebrow}</Typography>
              <Typography component="h1" className="expertise-page-title">
                {text.heroTitle} <Box component="span">{text.heroAccent}</Box>
              </Typography>
              <Typography className="expertise-page-intro">{text.intro}</Typography>
              <a className="expertise-hero-link" href="#expertise-gallery">
                <span>{text.explore}</span>
                <i className="expertise-arrow expertise-arrow-out" />
              </a>
            </Box>

            <Box className="expertise-hero-visual" aria-hidden="true">
              <Box
                className="expertise-hero-image expertise-hero-image-main"
                sx={{ backgroundImage: `url("${helioImage}")` }}
              />
              <Box
                className="expertise-hero-image expertise-hero-image-top"
                sx={{ backgroundImage: `url("${metroImage}")` }}
              />
              <Box
                className="expertise-hero-image expertise-hero-image-bottom"
                sx={{ backgroundImage: `url("${halfMoonImage}")` }}
              />
              <Box className="expertise-hero-orbit">
                <span />
                <Typography>BECT</Typography>
              </Box>
              <Typography className="expertise-hero-caption">
                Architecture / Engineering / Planning
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box id="expertise-gallery" className="expertise-gallery-section">
        <Container maxWidth="xl" className="expertise-page-shell">
          <Box className="expertise-gallery-toolbar">
            <Box className="expertise-mode-switch" role="tablist" aria-label={text.eyebrow}>
              {['services', 'sectors'].map((option) => {
                const optionCount = option === 'services' ? services.length : sectors.length;
                return (
                  <Box className="expertise-mode-option" key={option}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mode === option}
                      className={mode === option ? 'is-active' : ''}
                      onClick={() => selectMode(option)}
                    >
                      <Box className="expertise-filter-mark" aria-hidden="true">
                        <ExpertiseIcon name={option} />
                      </Box>
                      <Box className="expertise-filter-copy">
                        <strong>{text[option]}</strong>
                        <small>{text.select}</small>
                      </Box>
                      <span>{String(optionCount).padStart(2, '0')}</span>
                    </button>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box className={`expertise-mosaic expertise-mosaic-${mode}`}>
            {items.map((entry, index) => {
              return (
                <button
                  type="button"
                  className={`expertise-tile expertise-tile-${index + 1}`}
                  key={entry.title.en}
                  onClick={() => openItem(index)}
                >
                  <Box
                    className="expertise-tile-image"
                    sx={{ backgroundImage: `url("${entry.image}")` }}
                  />
                  <Box className="expertise-tile-shade" />
                  <Box className="expertise-tile-top">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </Box>
                  <Box className="expertise-tile-copy">
                    <Typography component="h2">{entry.title[language]}</Typography>
                    <Typography>{entry.description[language]}</Typography>
                  </Box>
                  <Box className="expertise-tile-action">
                    <span>{text.select}</span>
                    <i className="expertise-arrow expertise-arrow-out" />
                  </Box>
                </button>
              );
            })}
          </Box>

          <Box
            ref={detailRef}
            className={`expertise-detail ${detailOpen ? 'is-open' : ''}`}
            aria-hidden={!detailOpen}
          >
            <Box
              key={`${mode}-${active}-image`}
              className="expertise-detail-media"
              sx={{ backgroundImage: `url("${item.image}")` }}
            >
              <Box className="expertise-detail-media-shade" />
              <Typography aria-hidden="true">{String(active + 1).padStart(2, '0')}</Typography>
            </Box>
            <Box key={`${language}-${mode}-${active}`} className="expertise-detail-content">
              <button
                type="button"
                className="expertise-detail-close"
                aria-label="Close"
                onClick={() => setDetailOpen(false)}
              >
                <span aria-hidden="true">×</span>
              </button>
              <Box className="expertise-detail-heading">
                <Box className="expertise-detail-mark" aria-hidden="true">
                  <ExpertiseIcon name={item.code} />
                </Box>
                <Typography>
                  {mode === 'services' ? text.services : text.sectors} / {String(active + 1).padStart(2, '0')}
                </Typography>
              </Box>
              <Typography component="h2">{item.title[language]}</Typography>
              <Typography className="expertise-detail-description">{item.description[language]}</Typography>
              <Button onClick={onContactClick}>
                {text.contact}<i className="expertise-arrow expertise-arrow-out" />
              </Button>
              <Box className="expertise-detail-nav">
                <button type="button" onClick={() => move(-1)} aria-label={text.previous}>
                  <i className={`expertise-arrow ${isArabic ? 'expertise-arrow-right' : 'expertise-arrow-left'}`} />
                  <span>{text.previous}</span>
                </button>
                <Typography>{String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</Typography>
                <button type="button" onClick={() => move(1)} aria-label={text.next}>
                  <span>{text.next}</span>
                  <i className={`expertise-arrow ${isArabic ? 'expertise-arrow-left' : 'expertise-arrow-right'}`} />
                </button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default ExpertisePage;
