import React, { useEffect, useRef, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import ArrowOutwardRounded from '@mui/icons-material/ArrowOutwardRounded';
import VerifiedRounded from '@mui/icons-material/VerifiedRounded';
import idaLogo from '../assets/certifications/ida.svg';
import isoLogo from '../assets/certifications/iso-9001.svg';
import expertiseLogo from '../assets/certifications/expertise-house.svg';
import qualityLogo from '../assets/certifications/quality-management.svg';
import './CertificationsSection.css';

export const CERTIFICATE_LINKS = {
  ida: '',
  iso: '/certificates/iso-quality-management.pdf',
  expertise: '/certificates/expertise-house-register.pdf',
  quality: '/certificates/iso-quality-management.pdf',
};

const certificateLogos = {
  ida: idaLogo,
  iso: isoLogo,
  expertise: expertiseLogo,
  quality: qualityLogo,
};

const certificates = [
  {
    id: 'ida',
    code: 'IDA',
    title: { en: 'Accreditation by IDA', ar: 'اعتماد هيئة التنمية الصناعية' },
    detail: { en: 'Industrial Development Authority', ar: 'هيئة التنمية الصناعية' },
  },
  {
    id: 'iso',
    code: 'ISO 9001',
    title: { en: 'ISO 9001:2015', ar: 'شهادة ISO 9001:2015' },
    detail: { en: 'Quality Management System', ar: 'نظام إدارة الجودة' },
  },
  {
    id: 'expertise',
    code: 'EHEC',
    title: { en: 'Expertise House', ar: 'بيت الخبرة الهندسي' },
    detail: { en: 'Engineering Consultant Certification', ar: 'اعتماد الاستشارات الهندسية' },
  },
  {
    id: 'quality',
    code: 'QMS',
    title: { en: 'Quality Management Policy', ar: 'سياسة إدارة الجودة' },
    detail: { en: 'Governance, quality and performance', ar: 'الحوكمة والجودة والأداء' },
  },
];

const copy = {
  en: {
    eyebrow: 'Verified standards',
    title: 'Credentials built into our practice.',
    intro: 'Independent standards and professional accreditations that support every decision, drawing and delivery.',
    open: 'Open certificate',
    pending: 'View',
    aria: 'Open certificate for',
  },
  ar: {
    eyebrow: 'معايير موثوقة',
    title: 'اعتمادات راسخة في منهج عملنا.',
    intro: 'معايير مستقلة واعتمادات مهنية تدعم كل قرار وتصميم ومرحلة تنفيذ.',
    open: 'عرض الشهادة',
    pending: 'عرض',
    aria: 'عرض شهادة',
  },
};

function CertificationsSection({ language = 'en' }) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const isArabic = language === 'ar';
  const text = copy[language];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      component="section"
      ref={sectionRef}
      className={`certifications-section ${visible ? 'is-visible' : ''}`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <Container maxWidth="xl" className="certifications-shell">
        <Box className="certifications-heading">
          <Box>
            <Typography className="certifications-eyebrow">{text.eyebrow}</Typography>
            <Typography component="h2" className="certifications-title">{text.title}</Typography>
          </Box>
          <Typography className="certifications-intro">{text.intro}</Typography>
        </Box>

        <Box className="certifications-grid">
          {certificates.map((certificate, index) => {
            const href = CERTIFICATE_LINKS[certificate.id];

            return (
              <Box
                component={href ? 'a' : 'article'}
                href={href || undefined}
                target={href ? '_blank' : undefined}
                rel={href ? 'noreferrer' : undefined}
                key={certificate.id}
                className="certificate-card"
                sx={{ '--certificate-index': index }}
                aria-label={href ? `${text.aria} ${certificate.title[language]}` : undefined}
              >
                <Box className="certificate-topline">
                  <Typography>
                    {String(index + 1).padStart(2, '0')} / {String(certificates.length).padStart(2, '0')}
                  </Typography>
                  <VerifiedRounded />
                </Box>

                <Box className={`certificate-emblem certificate-emblem-${certificate.id}`}>
                  <Box
                    component="img"
                    src={certificateLogos[certificate.id]}
                    alt={`${certificate.title[language]} logo`}
                  />
                </Box>

                <Box className="certificate-copy">
                  <Typography className="certificate-code">{certificate.code}</Typography>
                  <Typography component="h3">{certificate.title[language]}</Typography>
                  <Typography>{certificate.detail[language]}</Typography>
                </Box>

                <Box className="certificate-action">
                  <Typography>{href ? text.open : text.pending}</Typography>
                  <ArrowOutwardRounded />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}

export default CertificationsSection;
