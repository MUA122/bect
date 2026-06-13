import React from 'react';
import { Box, Button, Container, MenuItem, TextField, Typography } from '@mui/material';
import ArrowOutwardRounded from '@mui/icons-material/ArrowOutwardRounded';
import EmailRounded from '@mui/icons-material/EmailRounded';
import LocationOnRounded from '@mui/icons-material/LocationOnRounded';
import PhoneRounded from '@mui/icons-material/PhoneRounded';
import ScheduleRounded from '@mui/icons-material/ScheduleRounded';
import SendRounded from '@mui/icons-material/SendRounded';
import './ContactPage.css';

const officeData = {
  en: [
    {
      id: 'egypt',
      index: '01',
      country: 'Egypt',
      city: 'Cairo',
      label: 'Head office',
      address: '17 Menof St., Almazah, Heliopolis, Cairo, Egypt',
      destination: 'BECT Engineering Consulting, 17 Menof, Almazah, Heliopolis, Cairo Governorate 4460293, Egypt',
      phone: '+20 (02) 24187866',
      phoneUrl: 'tel:+20224187866',
      locator: 'HELIOPOLIS / CAIRO',
      mapEmbed: 'https://www.google.com/maps?q=BECT%20Engineering%20Consulting%2C%2017%20Menof%2C%20Almazah%2C%20Heliopolis%2C%20Cairo%20Governorate%204460293%2C%20Egypt&z=16&output=embed',
      flagUrl: 'https://flagcdn.com/eg.svg',
      flagAlt: 'Flag of Egypt',
    },
    {
      id: 'saudi',
      index: '02',
      country: 'Saudi Arabia',
      city: 'Riyadh',
      label: 'Global office',
      address: '6071 King Abdelaziz Rd., Al Maseef District, Riyadh, KSA',
      destination: '6071 King Abdulaziz Road, Al Maseef, Riyadh, Saudi Arabia',
      phone: '+966 014535135',
      phoneUrl: 'tel:+966014535135',
      locator: 'AL MASEEF / RIYADH',
      mapEmbed: 'https://www.google.com/maps?q=6071%20King%20Abdulaziz%20Road%2C%20Al%20Maseef%2C%20Riyadh%2C%20Saudi%20Arabia&z=14&output=embed',
      flagUrl: 'https://flagcdn.com/sa.svg',
      flagAlt: 'Flag of Saudi Arabia',
    },
  ],
  ar: [
    {
      id: 'egypt',
      index: '01',
      country: 'مصر',
      city: 'القاهرة',
      label: 'المكتب الرئيسي',
      address: '17 شارع منوف، الماظة، مصر الجديدة، القاهرة، مصر',
      destination: 'BECT Engineering Consulting, 17 Menof, Almazah, Heliopolis, Cairo Governorate 4460293, Egypt',
      phone: '+20 (02) 24187866',
      phoneUrl: 'tel:+20224187866',
      locator: 'HELIOPOLIS / CAIRO',
      mapEmbed: 'https://www.google.com/maps?q=BECT%20Engineering%20Consulting%2C%2017%20Menof%2C%20Almazah%2C%20Heliopolis%2C%20Cairo%20Governorate%204460293%2C%20Egypt&z=16&output=embed',
      flagUrl: 'https://flagcdn.com/eg.svg',
      flagAlt: 'علم مصر',
    },
    {
      id: 'saudi',
      index: '02',
      country: 'المملكة العربية السعودية',
      city: 'الرياض',
      label: 'المكتب العالمي',
      address: '6071 طريق الملك عبدالعزيز، حي المصيف، الرياض، السعودية',
      destination: '6071 King Abdulaziz Road, Al Maseef, Riyadh, Saudi Arabia',
      phone: '+966 014535135',
      phoneUrl: 'tel:+966014535135',
      locator: 'AL MASEEF / RIYADH',
      mapEmbed: 'https://www.google.com/maps?q=6071%20King%20Abdulaziz%20Road%2C%20Al%20Maseef%2C%20Riyadh%2C%20Saudi%20Arabia&z=14&output=embed',
      flagUrl: 'https://flagcdn.com/sa.svg',
      flagAlt: 'علم المملكة العربية السعودية',
    },
  ],
};

const pageCopy = {
  en: {
    eyebrow: 'Contact BECT',
    title: 'Complex challenge?',
    titleAccent: 'Let’s talk.',
    intro: 'Whether you are shaping a city, a building, or critical infrastructure, the right conversation can move an ambitious idea forward.',
    response: 'Our team responds within two business days.',
    emailLabel: 'New business & general enquiries',
    phoneLabel: 'Speak with our Cairo office',
    formEyebrow: 'Start a conversation',
    formTitle: 'Tell us what you are building.',
    formIntro: 'Share the essentials. We will connect you with the people best suited to your project.',
    officesEyebrow: 'Meet us in the region',
    officesTitle: 'Two offices. One integrated team.',
    officesIntro: 'Local perspective in Egypt and Saudi Arabia, backed by multidisciplinary expertise across the region.',
    getDirections: 'Get directions',
    mapLabel: 'Location preview',
    direct: 'Direct contact',
  },
  ar: {
    eyebrow: 'تواصل مع BECT',
    title: 'لديك تحدٍ معقد؟',
    titleAccent: 'لنتحدث.',
    intro: 'سواء كنت تخطط لمدينة أو مبنى أو بنية تحتية حيوية، يمكن للمحادثة الصحيحة أن تدفع الفكرة الطموحة إلى الأمام.',
    response: 'يرد فريقنا خلال يومي عمل.',
    emailLabel: 'الأعمال الجديدة والاستفسارات العامة',
    phoneLabel: 'تحدث مع مكتبنا في القاهرة',
    formEyebrow: 'ابدأ محادثة',
    formTitle: 'أخبرنا عما تبنيه.',
    formIntro: 'شاركنا التفاصيل الأساسية، وسنصلك بالخبرات الأنسب لمشروعك.',
    officesEyebrow: 'التقِ بنا في المنطقة',
    officesTitle: 'مكتبان. فريق واحد متكامل.',
    officesIntro: 'فهم محلي عميق في مصر والسعودية، تدعمه خبرات متعددة التخصصات في أنحاء المنطقة.',
    getDirections: 'الاتجاهات',
    mapLabel: 'معاينة الموقع',
    direct: 'تواصل مباشر',
  },
};

function getDirectionsUrl(destination) {
  const encoded = encodeURIComponent(destination);
  if (typeof navigator !== 'undefined' && /iPad|iPhone|iPod|Macintosh/i.test(navigator.userAgent)) {
    return `https://maps.apple.com/?daddr=${encoded}&dirflg=d`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
}

function OfficeMap({ office, mapLabel }) {
  return (
    <Box className={`office-map office-map-${office.id}`} aria-label={`${mapLabel}: ${office.city}`}>
      <iframe
        src={office.mapEmbed}
        title={`${office.city} office map`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <Box className="map-interface">
        <Box className="map-location">
          <span><LocationOnRounded /></span>
          <Box>
            <Typography>BECT OFFICE</Typography>
            <strong>{office.city}</strong>
          </Box>
        </Box>
        <Typography className="map-live-label"><i /> LIVE MAP</Typography>
      </Box>
      <Box className="map-meta">
        <Typography dir="ltr">{office.locator}</Typography>
        <Typography>{mapLabel}</Typography>
      </Box>
    </Box>
  );
}

function ContactPage({ language = 'en', formText, formStatus, onSubmit }) {
  const isArabic = language === 'ar';
  const text = pageCopy[language];
  const offices = officeData[language];

  return (
    <Box component="main" className="contact-page" dir={isArabic ? 'rtl' : 'ltr'}>
      <Box className="contact-opening">
        <Container maxWidth="xl" className="contact-page-shell">
          <Box className="contact-opening-grid">
            <Box className="contact-opening-copy">
              <Typography className="contact-page-eyebrow">{text.eyebrow}</Typography>
              <Typography component="h1">
                {text.title}
                <span>{text.titleAccent}</span>
              </Typography>
              <Typography className="contact-page-intro">{text.intro}</Typography>

              <Box className="contact-direct-list">
                <a href="mailto:info@bect.net">
                  <span><EmailRounded /></span>
                  <Box>
                    <Typography>{text.emailLabel}</Typography>
                    <strong>info@bect.net</strong>
                  </Box>
                  <ArrowOutwardRounded />
                </a>
                <a href="tel:+20224187866">
                  <span><PhoneRounded /></span>
                  <Box>
                    <Typography>{text.phoneLabel}</Typography>
                    <strong dir="ltr">+20 (02) 24187866</strong>
                  </Box>
                  <ArrowOutwardRounded />
                </a>
              </Box>

              <Box className="contact-response-note">
                <ScheduleRounded />
                <Typography>{text.response}</Typography>
              </Box>
            </Box>

            <Box component="form" id="contact-form" className="contact-page-form" onSubmit={onSubmit}>
              <Typography className="contact-page-eyebrow">{text.formEyebrow}</Typography>
              <Typography component="h2">{text.formTitle}</Typography>
              <Typography className="contact-form-intro">{text.formIntro}</Typography>

              <Box className="contact-page-fields">
                <TextField name="name" label={formText.name} required fullWidth />
                <TextField name="email" label={formText.email} type="email" required fullWidth />
                <TextField name="phone" label={formText.phone} type="tel" fullWidth />
                <TextField name="company" label={formText.company} fullWidth />
                <TextField name="interest" label={formText.interest} select required fullWidth defaultValue="">
                  {formText.interests.map((interest) => <MenuItem key={interest} value={interest}>{interest}</MenuItem>)}
                </TextField>
                <TextField name="message" label={formText.message} required multiline minRows={5} fullWidth className="contact-page-message" />
              </Box>

              {formStatus !== 'idle' && formStatus !== 'sending' && (
                <Typography className={`form-notice ${formStatus}`}>{formText[formStatus]}</Typography>
              )}

              <Box className="contact-page-form-footer">
                <Typography>BECT · Cairo · Riyadh</Typography>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<SendRounded />}
                  disabled={formStatus === 'sending'}
                >
                  {formStatus === 'sending' ? formText.sending : formText.submit}
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box className="contact-offices">
        <Container maxWidth="xl" className="contact-page-shell">
          <Box className="contact-offices-heading">
            <Box>
              <Typography className="contact-page-eyebrow">{text.officesEyebrow}</Typography>
              <Typography component="h2">{text.officesTitle}</Typography>
            </Box>
            <Typography>{text.officesIntro}</Typography>
          </Box>

          <Box className="office-grid">
            {offices.map((office) => (
              <Box component="article" className="office-card" key={office.id}>
                <Box className="office-card-top">
                  <Box className="office-flag">
                    <img src={office.flagUrl} alt={office.flagAlt} loading="lazy" />
                  </Box>
                  <Typography className="office-index">{office.index}</Typography>
                </Box>

                <Box className="office-title-row">
                  <Box>
                    <Typography className="office-label">{office.label}</Typography>
                    <Typography component="h3">{office.city}</Typography>
                  </Box>
                  <Typography className="office-country">{office.country}</Typography>
                </Box>

                <OfficeMap office={office} mapLabel={text.mapLabel} />

                <Box className="office-details">
                  <Typography className="office-detail-label">{text.direct}</Typography>
                  <Box className="office-address">
                    <LocationOnRounded />
                    <Typography>{office.address}</Typography>
                  </Box>
                  <a className="office-phone" href={office.phoneUrl}>
                    <PhoneRounded />
                    <span dir="ltr">{office.phone}</span>
                  </a>
                  <Button
                    component="a"
                    href={getDirectionsUrl(office.destination)}
                    target="_blank"
                    rel="noreferrer"
                    endIcon={<ArrowOutwardRounded />}
                    className="directions-button"
                  >
                    {text.getDirections}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default ContactPage;
