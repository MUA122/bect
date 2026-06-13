import React, { useEffect, useRef, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import './LeadershipSection.css';

const leaders = [
  {
    id: 'omar',
    name: {
      en: 'Dr. Omar El Hosseiny',
      ar: 'د. عمر الحسيني',
    },
  },
  {
    id: 'ossama',
    name: {
      en: 'Dr. Ossama El Hosseiny',
      ar: 'د. أسامة الحسيني',
    },
  },
];

const copy = {
  en: {
    eyebrow: 'Leadership',
    title: 'Our CEOs',
    quote: 'The success of BECT lies in the power of collaboration. By bringing together the best minds in engineering and architecture, we foster a dynamic environment where creativity thrives and exceptional projects are born.',
  },
  ar: {
    eyebrow: 'القيادة',
    title: 'رؤساؤنا التنفيذيون',
    quote: 'يكمن نجاح BECT في قوة التعاون. فمن خلال جمع أفضل الخبرات في الهندسة والعمارة، نصنع بيئة ديناميكية تزدهر فيها الأفكار الإبداعية وتولد منها مشروعات استثنائية.',
  },
};

function LeadershipSection({ language = 'en' }) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
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
      id="about"
      ref={sectionRef}
      className={`leadership-section ${visible ? 'is-visible' : ''}`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <Container maxWidth="xl" className="leadership-shell">
        <Box className="leadership-copy">
          <Typography className="leadership-eyebrow">{text.eyebrow}</Typography>
          <Typography component="h2" className="leadership-title">{text.title}</Typography>

          <Box className="leader-names">
            {leaders.map((leader) => (
              <Box className="leader-row" key={leader.id}>
                <Typography component="h3">{leader.name[language]}</Typography>
              </Box>
            ))}
          </Box>

          <Box component="blockquote" className="leadership-quote">
            <Typography>“{text.quote}”</Typography>
          </Box>
        </Box>

        <Box className="leadership-portrait">
          <Box
            component="img"
            src="https://www.bect.net/static/bosses3.png"
            alt={`${leaders[0].name[language]} & ${leaders[1].name[language]}`}
          />
        </Box>
      </Container>
      <Box className="leadership-divider" aria-hidden="true" />
    </Box>
  );
}

export default LeadershipSection;
