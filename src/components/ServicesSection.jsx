import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Container, IconButton, Typography } from '@mui/material';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import ArrowOutwardRounded from '@mui/icons-material/ArrowOutwardRounded';
import './ServicesSection.css';

const services = [
  {
    title: { en: 'Architecture & Interior Design', ar: 'العمارة والتصميم الداخلي' },
    short: { en: 'Architecture', ar: 'العمارة' },
    description: {
      en: 'Our multidisciplinary capabilities give us the freedom to create architecture that is distinctive, responsive and deeply connected to each client’s vision. We bring together spatial clarity, innovative materials and human experience to shape places with lasting value.',
      ar: 'تمنحنا خبراتنا متعددة التخصصات الحرية لابتكار عمارة مميزة ومتجاوبة ترتبط بعمق برؤية كل عميل. نجمع بين وضوح الفراغ والمواد المبتكرة والتجربة الإنسانية لصياغة أماكن ذات قيمة مستدامة.',
    },
    image: 'https://bect-bak.s3.amazonaws.com/media/images/Helio.jpg',
  },
  {
    title: { en: 'Civil & Structural Design', ar: 'التصميم المدني والإنشائي' },
    short: { en: 'Structures', ar: 'الإنشاءات' },
    description: {
      en: 'BECT’s civil and structural engineers design and supervise complex projects and systems including roads, bridges, buildings, airports, tunnels, dams, water networks and wastewater infrastructure, balancing resilience, efficiency and constructability.',
      ar: 'يصمم مهندسو BECT المدنيون والإنشائيون المشروعات والأنظمة المعقدة ويشرفون عليها، بما يشمل الطرق والجسور والمباني والمطارات والأنفاق والسدود وشبكات المياه والصرف، مع تحقيق التوازن بين المتانة والكفاءة وقابلية التنفيذ.',
    },
    image: 'https://bect-bak.s3.amazonaws.com/media/images/Wadi_Dayqah.jpeg',
  },
  {
    title: { en: 'Landscape Design', ar: 'تصميم المناظر الطبيعية' },
    short: { en: 'Landscape', ar: 'تنسيق المواقع' },
    description: {
      en: 'Thoughtful landscapes invite people in, encourage movement and offer moments of relief from the pace of modern life. Our designs respond to climate, culture and ecology to create generous public realms that feel rooted in place.',
      ar: 'تدعو المناظر الطبيعية المدروسة الناس إلى التفاعل والحركة، وتوفر لحظات من الهدوء بعيدًا عن إيقاع الحياة الحديثة. تستجيب تصاميمنا للمناخ والثقافة والبيئة لتكوين مساحات عامة رحبة تنتمي إلى مكانها.',
    },
    image: 'https://bect-bak.s3.amazonaws.com/media/images/Half_Moon.png',
  },
  {
    title: { en: 'Urban Design & Planning', ar: 'التصميم والتخطيط العمراني' },
    short: { en: 'Urbanism', ar: 'العمران' },
    description: {
      en: 'Our urban planning services span metropolitan and regional development, infrastructure planning and major urban renewal. We connect land use, mobility, public space and economic opportunity into clear frameworks for long-term growth.',
      ar: 'تشمل خدماتنا في التخطيط العمراني التنمية الحضرية والإقليمية، وتخطيط البنية التحتية، وتجديد المدن الكبرى. نربط استخدامات الأراضي والحركة والفراغات العامة والفرص الاقتصادية ضمن أطر واضحة للنمو طويل المدى.',
    },
    image: 'https://bect-bak.s3.amazonaws.com/media/images/Metro4B-08.jpg',
  },
  {
    title: { en: 'MEP & Firefighting', ar: 'الأعمال الكهروميكانيكية ومكافحة الحريق' },
    short: { en: 'MEP Systems', ar: 'الأنظمة الكهروميكانيكية' },
    description: {
      en: 'Mechanical, electrical and plumbing systems are essential to safe, efficient and comfortable environments. Our integrated expertise covers HVAC, lighting, firefighting, fire alarm, water supply, sanitation and intelligent building systems.',
      ar: 'تمثل الأنظمة الميكانيكية والكهربائية والصحية أساس البيئات الآمنة والكفؤة والمريحة. تغطي خبراتنا المتكاملة التكييف والإضاءة ومكافحة وإنذار الحريق وإمدادات المياه والصرف وأنظمة المباني الذكية.',
    },
    image: 'https://bect-bak.s3.amazonaws.com/media/images/Schneider.jpeg',
  },
  {
    title: { en: 'Project Management & Site Supervision', ar: 'إدارة المشروعات والإشراف على المواقع' },
    short: { en: 'Management', ar: 'إدارة المشروعات' },
    description: {
      en: 'Our experienced teams monitor, coordinate and guide every project activity with strong technical discipline. We protect quality, safety, programme and environmental performance from early planning through delivery.',
      ar: 'تراقب فرقنا ذات الخبرة جميع أنشطة المشروع وتنسقها وتوجهها بانضباط تقني راسخ. نحافظ على الجودة والسلامة والبرنامج الزمني والأداء البيئي منذ التخطيط المبكر وحتى التسليم.',
    },
    image: 'https://bect-bak.s3.amazonaws.com/media/images/Utopia.jpeg',
  },
];

const sectionCopy = {
  en: {
    eyebrow: 'Integrated expertise',
    title: 'Our services',
    intro: 'Six disciplines. One coordinated vision. Explore how our teams turn complexity into places and systems that perform beautifully.',
    explore: 'Explore expertise',
    previous: 'Previous service',
    next: 'Next service',
  },
  ar: {
    eyebrow: 'خبرات متكاملة',
    title: 'خدماتنا',
    intro: 'ستة تخصصات برؤية واحدة متكاملة. اكتشف كيف تحول فرقنا التعقيد إلى أماكن وأنظمة تجمع بين جمال التصميم وكفاءة الأداء.',
    explore: 'استكشف خبراتنا',
    previous: 'الخدمة السابقة',
    next: 'الخدمة التالية',
  },
};

function ServicesSection({ language = 'en' }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);
  const isArabic = language === 'ar';
  const text = sectionCopy[language];
  const service = services[active];

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
      { threshold: 0.15 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const changeService = (direction) => {
    setActive((current) => (current + direction + services.length) % services.length);
  };

  return (
    <Box
      component="section"
      id="expertise"
      ref={sectionRef}
      className={`services-section ${visible ? 'is-visible' : ''}`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <Container maxWidth="xl" className="services-shell">
        <Box className="services-heading">
          <Box>
            <Typography className="services-eyebrow">{text.eyebrow}</Typography>
            <Typography component="h2" className="services-title">{text.title}</Typography>
          </Box>
          <Typography className="services-intro">{text.intro}</Typography>
        </Box>

        <Box className="services-stage">
          <Box className="services-visual">
            {services.map((item, index) => (
              <Box
                key={item.title.en}
                role="img"
                aria-label={item.title[language]}
                className={`service-image ${active === index ? 'is-active' : ''}`}
                sx={{ backgroundImage: `url("${item.image}")` }}
              />
            ))}
            <Box className="service-image-wash" />
            <Typography className="service-ghost-number" aria-hidden="true">
              {String(active + 1).padStart(2, '0')}
            </Typography>

            <Box key={`${language}-${active}`} className="service-story">
              <Typography className="service-count">
                {String(active + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
              </Typography>
              <Typography component="h3" className="service-name">{service.title[language]}</Typography>
              <Typography className="service-description">{service.description[language]}</Typography>
              <Button href="#contact" endIcon={<ArrowOutwardRounded />} className="service-explore">
                {text.explore}
              </Button>
            </Box>

            <Box className="service-controls">
              <IconButton aria-label={text.previous} onClick={() => changeService(-1)}>
                {isArabic ? <ArrowForwardRounded /> : <ArrowBackRounded />}
              </IconButton>
              <Box className="service-progress">
                <Box sx={{ width: `${((active + 1) / services.length) * 100}%` }} />
              </Box>
              <IconButton aria-label={text.next} onClick={() => changeService(1)}>
                {isArabic ? <ArrowBackRounded /> : <ArrowForwardRounded />}
              </IconButton>
            </Box>
          </Box>

          <Box component="nav" aria-label={text.title} className="services-rail">
            {services.map((item, index) => (
              <button
                type="button"
                key={item.title.en}
                className={`service-tab ${active === index ? 'is-active' : ''}`}
                onClick={() => setActive(index)}
                aria-current={active === index ? 'true' : undefined}
              >
                <span className="service-tab-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="service-tab-label">{item.short[language]}</span>
                <span className="service-tab-line" />
              </button>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default ServicesSection;
