import React, { useEffect, useRef, useState } from 'react';
import { Box, Container, IconButton, Typography } from '@mui/material';
import LinkedIn from '@mui/icons-material/LinkedIn';
import './LeadershipSection.css';

// Replace these with the personal profile URLs when they are available.
const LINKEDIN_PROFILES = {
  omar: 'https://www.linkedin.com/company/bectconsulting/',
  ossama: 'https://www.linkedin.com/company/bectconsulting/',
};

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
    title: 'Built on partnership.',
    role: 'Co-CEOs',
    quote: 'The success of BECT lies in the power of collaboration. By bringing together the best minds in engineering and architecture, we foster a dynamic environment where creativity thrives and exceptional projects are born.',
    linkedin: 'View LinkedIn profile for',
  },
  ar: {
    eyebrow: 'القيادة',
    title: 'شراكة تصنع النجاح.',
    role: 'الرئيسان التنفيذيان المشاركان',
    quote: 'يكمن نجاح BECT في قوة التعاون. فمن خلال جمع أفضل الخبرات في الهندسة والعمارة، نصنع بيئة ديناميكية تزدهر فيها الأفكار الإبداعية وتولد منها مشروعات استثنائية.',
    linkedin: 'عرض حساب لينكدإن الخاص بـ',
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
            {leaders.map((leader, index) => (
              <Box className="leader-row" key={leader.id}>
                <Box>
                  <Typography component="h3">{leader.name[language]}</Typography>
                  {index === 0 && <Typography className="leadership-role">{text.role}</Typography>}
                </Box>
                <IconButton
                  component="a"
                  href={LINKEDIN_PROFILES[leader.id]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${text.linkedin} ${leader.name[language]}`}
                  className="leader-linkedin"
                >
                  <LinkedIn />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Box component="blockquote" className="leadership-quote">
            <Typography>{text.quote}</Typography>
          </Box>
        </Box>

        <Box className="leadership-portrait">
          <Box className="leadership-orbit" aria-hidden="true" />
          <Typography className="leadership-year" aria-hidden="true">35+</Typography>
          <Box
            component="img"
            src="https://www.bect.net/static/bosses3.png"
            alt={`${leaders[0].name[language]} & ${leaders[1].name[language]}`}
          />
          <Box className="leadership-caption">
            <span>BECT</span>
            <span>{text.role}</span>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default LeadershipSection;
