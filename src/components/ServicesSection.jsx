import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Container, IconButton, Typography } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import ArrowOutwardRounded from "@mui/icons-material/ArrowOutwardRounded";
import schneiderMepImage from "../assets/projects/schneider-mep-main.jpg";
import "./ServicesSection.css";

const services = [
  {
    title: { en: "Architecture", ar: "العمارة" },
    short: { en: "Architecture", ar: "العمارة" },
    description: {
      en: "We design spaces that serve communities, respond to client needs and create memorable experiences. Good architecture balances function, context and a rich human experience.",
      ar: "نصمم مساحات تخدم المجتمعات وتستجيب لاحتياجات العملاء وتقدم تجارب مميزة. فالعمارة الجيدة توازن بين الوظيفة والسياق والتجربة الإنسانية الغنية.",
    },
    image: "/projects/profile/26-cairo-historic-panorama.jpg",
  },
  {
    title: { en: "Landscape", ar: "تنسيق المواقع" },
    short: { en: "Landscape", ar: "تنسيق المواقع" },
    description: {
      en: "Outdoor arrangement and design sit at the heart of many projects, encouraging social interaction and everyday comfort. Our landscapes combine aesthetic quality with functional purpose.",
      ar: "يمثل تنسيق المواقع وتصميم المساحات الخارجية جزءاً أساسياً من العديد من المشروعات، إذ يشجع التفاعل الاجتماعي والراحة اليومية. تجمع أعمالنا بين القيمة الجمالية والوظيفة العملية.",
    },
    image: "/projects/profile/40-People-Square.png",
  },
  {
    title: { en: "Planning & Urban Design", ar: "التخطيط والتصميم العمراني" },
    short: { en: "Planning & Urban Design", ar: "التخطيط العمراني" },
    description: {
      en: "We build solid urban frameworks with no future restrictions to development and expansion. Our services cover metropolitan and regional development, master planning and major urban upgrades.",
      ar: "نبني أطرًا عمرانية راسخة تتيح التطوير والتوسع المستقبلي. وتشمل خدماتنا التنمية الحضرية والإقليمية والمخططات العامة والتطوير العمراني واسع النطاق.",
    },
    image: "/projects/profile/14-al-mukaymen-city.jpg",
  },
  {
    title: { en: "Structure", ar: "التصميم الإنشائي" },
    short: { en: "Structure", ar: "الإنشاءات" },
    description: {
      en: "We ensure the safety and endurance of every design, supporting architecture from concept to delivery. Our teams work across all structural building types and levels of complexity.",
      ar: "نضمن سلامة التصميم واستدامته، وندعم العمارة من الفكرة حتى التنفيذ. تعمل فرقنا على مختلف أنواع المباني الإنشائية وبدرجات تعقيد متعددة.",
    },
    image: "/projects/profile/27-coc2-center-of-excellence.jpg",
  },
  {
    title: {
      en: "Project Management and Supervision",
      ar: "إدارة المشروعات والإشراف",
    },
    short: { en: "Project Management", ar: "إدارة المشروعات" },
    description: {
      en: "Close follow-up between the design team and site supervision team is essential to reach optimum time, cost, quality and performance on every project.",
      ar: "يمثل التنسيق المستمر بين فريق التصميم وفريق الإشراف على الموقع عاملاً أساسياً لتحقيق أفضل نتائج في الوقت والتكلفة والجودة والأداء.",
    },
    image: "/projects/profile/15-state-security-headquarters.jpg",
  },
  {
    title: { en: "Civil", ar: "الأعمال المدنية" },
    short: { en: "Civil", ar: "المدني" },
    description: {
      en: "Our civil work covers roads, bridges, buildings, airports, tunnels, dams, irrigation systems, and water and wastewater networks.",
      ar: "تشمل أعمالنا المدنية الطرق والجسور والمباني والمطارات والأنفاق والسدود وأنظمة الري وشبكات المياه والصرف الصحي.",
    },
    image: "/projects/profile/91-port-said-tunnels.jpg",
  },
  {
    title: { en: "MEP", ar: "الأعمال الكهروميكانيكية" },
    short: { en: "MEP", ar: "الكهروميكانيكا" },
    description: {
      en: "MEP covers the building services associated with safe and comfortable environments, including HVAC, plumbing, lighting, firefighting, fire alarm, water supply and sanitary systems.",
      ar: "تشمل الأعمال الكهروميكانيكية خدمات المباني المرتبطة ببيئات آمنة ومريحة، ومنها التكييف والسباكة والإضاءة ومكافحة وإنذار الحريق وإمدادات المياه والصرف الصحي.",
    },
    image: schneiderMepImage,
  },
];

const sectionCopy = {
  en: {
    eyebrow: "Integrated expertise",
    title: "Our services",
    intro:
      "Seven disciplines. One coordinated vision. Explore how our teams turn complexity into places and systems that perform beautifully.",
    explore: "Explore expertise",
    previous: "Previous service",
    next: "Next service",
  },
  ar: {
    eyebrow: "خبرات متكاملة",
    title: "خدماتنا",
    intro:
      "سبعة تخصصات برؤية واحدة متكاملة. اكتشف كيف تحول فرقنا التعقيد إلى أماكن وأنظمة تجمع بين جمال التصميم وكفاءة الأداء.",
    explore: "استكشف خبراتنا",
    previous: "الخدمة السابقة",
    next: "الخدمة التالية",
  },
};

function ServicesSection({ language = "en" }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);
  const isArabic = language === "ar";
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
    setActive(
      (current) => (current + direction + services.length) % services.length,
    );
  };

  return (
    <Box
      component="section"
      id="expertise"
      ref={sectionRef}
      className={`services-section ${visible ? "is-visible" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Container maxWidth="xl" className="services-shell">
        <Box className="services-heading">
          <Box>
            <Typography className="services-eyebrow">{text.eyebrow}</Typography>
            <Typography component="h2" className="services-title">
              {text.title}
            </Typography>
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
                className={`service-image ${active === index ? "is-active" : ""}`}
                sx={{ backgroundImage: `url("${item.image}")` }}
              />
            ))}
            <Box className="service-image-wash" />
            <Typography className="service-ghost-number" aria-hidden="true">
              {String(active + 1).padStart(2, "0")}
            </Typography>

            <Box key={`${language}-${active}`} className="service-story">
              <Typography className="service-count">
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(services.length).padStart(2, "0")}
              </Typography>
              <Typography component="h3" className="service-name">
                {service.title[language]}
              </Typography>
              <Typography className="service-description">
                {service.description[language]}
              </Typography>
              <Button
                href="#contact"
                endIcon={<ArrowOutwardRounded />}
                className="service-explore"
              >
                {text.explore}
              </Button>
            </Box>

            <Box className="service-controls">
              <IconButton
                aria-label={text.previous}
                onClick={() => changeService(-1)}
              >
                {isArabic ? <ArrowForwardRounded /> : <ArrowBackRounded />}
              </IconButton>
              <Box className="service-progress">
                <Box
                  sx={{ width: `${((active + 1) / services.length) * 100}%` }}
                />
              </Box>
              <IconButton
                aria-label={text.next}
                onClick={() => changeService(1)}
              >
                {isArabic ? <ArrowBackRounded /> : <ArrowForwardRounded />}
              </IconButton>
            </Box>
          </Box>

          <Box
            component="nav"
            aria-label={text.title}
            className="services-rail"
          >
            {services.map((item, index) => (
              <button
                type="button"
                key={item.title.en}
                className={`service-tab ${active === index ? "is-active" : ""}`}
                onClick={() => setActive(index)}
                aria-current={active === index ? "true" : undefined}
              >
                <span className="service-tab-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="service-tab-label">
                  {item.short[language]}
                </span>
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
