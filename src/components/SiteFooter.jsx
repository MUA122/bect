import React from 'react';
import { Box, Button, Container, IconButton, Typography } from '@mui/material';
import ArrowOutwardRounded from '@mui/icons-material/ArrowOutwardRounded';
import EmailRounded from '@mui/icons-material/EmailRounded';
import FacebookRounded from '@mui/icons-material/FacebookRounded';
import Instagram from '@mui/icons-material/Instagram';
import LinkedIn from '@mui/icons-material/LinkedIn';
import LocationOnRounded from '@mui/icons-material/LocationOnRounded';
import PhoneRounded from '@mui/icons-material/PhoneRounded';
import './SiteFooter.css';

const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/bectconsulting/', icon: LinkedIn },
  { label: 'Instagram', href: 'https://www.instagram.com/bect_consult/', icon: Instagram },
  { label: 'Facebook', href: 'https://www.facebook.com/bectconsulting/', icon: FacebookRounded },
];

const offices = {
  en: [
    {
      name: 'Riyadh, KSA',
      address: '11 Al Masif district, Riyadh, KSA',
      mapUrl: 'https://maps.google.com/?q=11+Al+Masif+district+Riyadh+KSA',
      phone: '+966 014535135',
      phoneUrl: 'tel:+966014535135',
    },
    {
      name: 'Cairo, Egypt',
      address: '17 Minuf St., Heliopolis, Cairo, Egypt',
      mapUrl: 'https://maps.google.com/?q=17+Minuf+St+Heliopolis+Cairo+Egypt',
      phone: '+20 (02) 24187866',
      phoneUrl: 'tel:+20224187866',
    },
  ],
  ar: [
    {
      name: 'الرياض، المملكة العربية السعودية',
      address: 'حي المصيف، شارع رقم 11، الرياض، المملكة العربية السعودية',
      mapUrl: 'https://maps.google.com/?q=11+Al+Masif+district+Riyadh+KSA',
      phone: '+966 014535135',
      phoneUrl: 'tel:+966014535135',
    },
    {
      name: 'القاهرة، مصر',
      address: '17 شارع منوف، مصر الجديدة، القاهرة، مصر',
      mapUrl: 'https://maps.google.com/?q=17+Minuf+St+Heliopolis+Cairo+Egypt',
      phone: '+20 (02) 24187866',
      phoneUrl: 'tel:+20224187866',
    },
  ],
};

const copy = {
  en: {
    eyebrow: 'Start something meaningful',
    title: 'Have a challenge worth solving?',
    intro: 'Bring us your ambition, complexity and questions. We will bring the right minds to the table.',
    contact: 'Contact us',
    office: 'Cairo office',
    address: '17 Menof St., Heliopolis, Cairo, Egypt',
    connect: 'Follow our work',
    navigation: 'Explore',
    links: ['Home', 'Expertise', 'Projects', 'About us'],
    statement: 'Architects and engineers shaping places, systems and infrastructure with purpose.',
    rights: 'All rights reserved.',
    privacy: 'Privacy',
  },
  ar: {
    eyebrow: 'لنبدأ شيئًا مؤثرًا',
    title: 'هل لديك تحدٍ يستحق الحل؟',
    intro: 'شاركنا طموحك وتفاصيل مشروعك وأسئلتك، وسنجمع الخبرات المناسبة لصناعة الحل.',
    contact: 'تواصل معنا',
    office: 'مكتب القاهرة',
    address: '17 شارع منوف، مصر الجديدة، القاهرة، مصر',
    connect: 'تابع أعمالنا',
    navigation: 'استكشف',
    links: ['الرئيسية', 'خبراتنا', 'مشاريعنا', 'من نحن'],
    statement: 'معماريون ومهندسون نصنع أماكن وأنظمة وبنية تحتية ذات أثر.',
    rights: 'جميع الحقوق محفوظة.',
    privacy: 'الخصوصية',
  },
};

function FooterLogo() {
  return (
    <Box className="footer-logo" aria-label="BECT Architects and Engineers">
      <Typography>BECT</Typography>
      <span>ARCHITECTS &amp; ENGINEERS</span>
    </Box>
  );
}

function SiteFooter({ language = 'en', onContactClick }) {
  const isArabic = language === 'ar';
  const text = copy[language];
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" className="site-footer" dir={isArabic ? 'rtl' : 'ltr'}>
      <Container maxWidth="xl" className="footer-shell">
        <Box className="footer-cta">
          <Box className="footer-cta-copy">
            <Typography className="footer-eyebrow">{text.eyebrow}</Typography>
            <Typography component="h2">{text.title}</Typography>
            <Typography>{text.intro}</Typography>
          </Box>
          <Button
            type="button"
            onClick={onContactClick}
            endIcon={<ArrowOutwardRounded />}
            className="footer-contact-button"
          >
            {text.contact}
          </Button>
          <Typography className="footer-cta-number" aria-hidden="true">01</Typography>
        </Box>

        <Box className="footer-main">
          <Box className="footer-brand">
            <FooterLogo />
            <Typography>{text.statement}</Typography>
          </Box>

          <Box className="footer-column footer-office">
            {offices[language].map((office) => (
              <Box className="footer-office-entry" key={office.name}>
                <Typography className="footer-column-title">{office.name}</Typography>
                <a href={office.mapUrl} target="_blank" rel="noreferrer">
                  <LocationOnRounded /><span>{office.address}</span>
                </a>
                <a href={office.phoneUrl}>
                  <PhoneRounded /><span dir="ltr">{office.phone}</span>
                </a>
              </Box>
            ))}
            <a className="footer-office-email" href="mailto:info@bect.net">
              <EmailRounded /><span>info@bect.net</span>
            </a>
          </Box>

          <Box className="footer-column footer-navigation">
            <Typography className="footer-column-title">{text.navigation}</Typography>
            {text.links.map((link, index) => (
              <a key={link} href={['#home', '#expertise', '#projects', '#about'][index]}>
                <span>{String(index + 1).padStart(2, '0')}</span>{link}
              </a>
            ))}
          </Box>

          <Box className="footer-column footer-social">
            <Typography className="footer-column-title">{text.connect}</Typography>
            <Box className="footer-social-grid">
              {socials.map(({ label, href, icon: Icon }) => (
                <IconButton
                  key={label}
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                >
                  <Icon />
                  <span>{label}</span>
                </IconButton>
              ))}
            </Box>
          </Box>
        </Box>

        <Box className="footer-bottom">
          <Typography>© {currentYear} BECT. {text.rights}</Typography>
          <a href="https://www.bect.net" target="_blank" rel="noreferrer">bect.net <ArrowOutwardRounded /></a>
          <Typography className="footer-signature">35+ <span>Years of impact</span></Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default SiteFooter;
