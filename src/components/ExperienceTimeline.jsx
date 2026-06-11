import React, { useEffect, useRef, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import './ExperienceTimeline.css';

const milestones = [
  {
    year: '1989',
    text: { en: 'Established in Cairo', ar: 'تأسيس الشركة في القاهرة' },
  },
  {
    year: '1993',
    text: { en: 'First major national project: Greater Cairo Metro', ar: 'أول مشروع قومي كبير: مترو القاهرة الكبرى' },
  },
  {
    year: '1996',
    text: { en: 'First international projects across Asia and Africa', ar: 'أولى المشروعات الدولية في آسيا وأفريقيا' },
  },
  {
    year: '2002',
    text: { en: 'Sogreah Middle East partnership', ar: 'شراكة سوجريا الشرق الأوسط' },
  },
  {
    year: '2009',
    text: { en: 'First prize in the international Ramses Square competition', ar: 'المركز الأول في المسابقة الدولية لميدان رمسيس' },
  },
  {
    year: '2011',
    text: { en: 'Entry into the Saudi market', ar: 'دخول السوق السعودي' },
  },
  {
    year: '2013',
    text: { en: 'Mega project: Half Moon Bay in KSA', ar: 'مشروع ضخم: خليج نصف القمر في السعودية' },
  },
  {
    year: '2016',
    text: { en: 'Mega project with the National Authority of Tunnels', ar: 'مشروع ضخم مع الهيئة القومية للأنفاق' },
  },
  {
    year: '2017',
    text: { en: 'Mega project with Électricité de France', ar: 'مشروع ضخم مع كهرباء فرنسا' },
  },
  {
    year: '2020',
    text: { en: 'World’s largest textile weaving and dyeing factory', ar: 'أكبر مصنع عالمي للنسيج والصباغة' },
  },
  {
    year: '2023',
    text: { en: 'World Bank Upper Egypt local development programme', ar: 'برنامج البنك الدولي للتنمية المحلية في صعيد مصر' },
  },
  {
    year: '2025',
    text: {
      en: 'Establishment of Second KSA Office in Jeddah',
      ar: 'تأسيس المكتب الثاني في المملكة العربية السعودية بمدينة جدة',
    },
  },
];

const copy = {
  en: {
    eyebrow: 'Our journey',
    titleStart: 'Decades of',
    titleAccent: 'Experience',
    intro: 'Seeking out challenges that allow us to learn, evolve and become better at what we do, from day one.',
    instruction: 'Select a milestone',
  },
  ar: {
    eyebrow: 'رحلتنا',
    titleStart: 'عقود من',
    titleAccent: 'الخبرة',
    intro: 'نبحث منذ اليوم الأول عن التحديات التي تمنحنا فرصة للتعلم والتطور والارتقاء المستمر بما نقدمه.',
    instruction: 'اختر محطة زمنية',
  },
};

function ExperienceTimeline({ language = 'en' }) {
  const [active, setActive] = useState(milestones.length - 1);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);
  const isArabic = language === 'ar';
  const text = copy[language];

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
      { threshold: 0.2 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      component="section"
      ref={sectionRef}
      className={`experience-section ${visible ? 'is-visible' : ''}`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <Box className="experience-background" aria-hidden="true" />
      <Box className="experience-overlay" aria-hidden="true" />

      <Container maxWidth="xl" className="experience-shell">
        <Box className="experience-heading">
          <Typography className="experience-eyebrow">{text.eyebrow}</Typography>
          <Typography component="h2" className="experience-title">
            {text.titleStart} <Box component="span">{text.titleAccent}</Box>
          </Typography>
          <Typography className="experience-intro">{text.intro}</Typography>
          <Box key={`${language}-${active}`} className="timeline-feature">
            <Typography>{milestones[active].year}</Typography>
            <Typography>{milestones[active].text[language]}</Typography>
          </Box>
        </Box>

        <Box className="timeline-desktop">
          <svg className="timeline-route" viewBox="0 0 1200 310" preserveAspectRatio="none" aria-hidden="true">
            <path
              className="timeline-route-base"
              d="M60 104 H1100 C1150 104 1170 124 1170 163 C1170 202 1150 222 1100 222 H180"
            />
            <path
              className="timeline-route-progress"
              pathLength="1"
              d="M60 104 H1100 C1150 104 1170 124 1170 163 C1170 202 1150 222 1100 222 H180"
            />
          </svg>

          <Box className="timeline-row timeline-row-top">
            {milestones.slice(0, 6).map((milestone, index) => (
              <button
                type="button"
                key={milestone.year}
                className={`timeline-milestone ${active === index ? 'is-active' : ''}`}
                onClick={() => setActive(index)}
              >
                <span className="timeline-year">{milestone.year}</span>
                <span className="timeline-copy">{milestone.text[language]}</span>
                <span className="timeline-node" />
              </button>
            ))}
          </Box>

          <Box className="timeline-row timeline-row-bottom">
            {milestones.slice(6).reverse().map((milestone) => {
              const index = milestones.indexOf(milestone);
              return (
                <button
                  type="button"
                  key={milestone.year}
                  className={`timeline-milestone ${active === index ? 'is-active' : ''}`}
                  onClick={() => setActive(index)}
                >
                  <span className="timeline-node" />
                  <span className="timeline-year">{milestone.year}</span>
                  <span className="timeline-copy">{milestone.text[language]}</span>
                </button>
              );
            })}
          </Box>

        </Box>

        <Box className="timeline-mobile">
          <Typography className="timeline-mobile-hint">{text.instruction}</Typography>
          <Box className="timeline-mobile-track">
            {milestones.map((milestone, index) => (
              <button
                type="button"
                key={milestone.year}
                className={`timeline-mobile-card ${active === index ? 'is-active' : ''}`}
                onClick={() => setActive(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{milestone.year}</strong>
                <p>{milestone.text[language]}</p>
              </button>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default ExperienceTimeline;
