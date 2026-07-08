import React, { useState } from "react";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import { Box, Container, Typography } from "@mui/material";
import ArchitectureRounded from "@mui/icons-material/ArchitectureRounded";
import BusinessRounded from "@mui/icons-material/BusinessRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import LanguageRounded from "@mui/icons-material/LanguageRounded";
import LocationOnRounded from "@mui/icons-material/LocationOnRounded";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import archAshrafImage from "../assets/team/arch-ashraf.png";
import drHayssamImage from "../assets/team/dr-hayssam.png";
import engGalalImage from "../assets/team/eng-galal.png";
import engHeshamImage from "../assets/team/eng-hisham.png";
import engHodaImage from "../assets/team/eng-hoda.png";
import engRamiImage from "../assets/team/eng-rami.png";
import engShabanImage from "../assets/team/eng-shaban.png";
import mrHossamImage from "../assets/team/mr-hossam.png";
import PartnerLogoCarousel from "./PartnerLogoCarousel";
import "./AboutPage.css";

const milestones = [
  { year: "1989", en: "Established in Cairo", ar: "تأسست الشركة في القاهرة" },
  {
    year: "1993",
    en: "First major national project: Greater Cairo Metro",
    ar: "أول مشروع قومي كبير: مترو القاهرة الكبرى",
  },
  {
    year: "1996",
    en: "First international projects across Asia and Africa",
    ar: "أولى المشروعات الدولية في آسيا وأفريقيا",
  },
  {
    year: "2002",
    en: "Sogreah Middle East partnership",
    ar: "شراكة سوجريا الشرق الأوسط",
  },
  {
    year: "2009",
    en: "First prize in the Ramses Square international competition",
    ar: "المركز الأول في المسابقة الدولية لميدان رمسيس",
  },
  { year: "2011", en: "Entered the Saudi market", ar: "دخول السوق السعودي" },
  {
    year: "2013",
    en: "Half Moon Bay mega project in Saudi Arabia",
    ar: "مشروع خليج نصف القمر الضخم في السعودية",
  },
  {
    year: "2016",
    en: "Mega project with the National Authority for Tunnels",
    ar: "مشروع ضخم مع الهيئة القومية للأنفاق",
  },
  {
    year: "2017",
    en: "Major programme with Electricité de France",
    ar: "برنامج رئيسي مع كهرباء فرنسا",
  },
  {
    year: "2020",
    en: "World-scale textile weaving and dyeing complex",
    ar: "مجمع عالمي للغزل والنسيج والصباغة",
  },
  {
    year: "2023",
    en: "World Bank Upper Egypt Local Development Programme",
    ar: "برنامج البنك الدولي للتنمية المحلية في صعيد مصر",
  },
  {
    year: "2025",
    en: "Second Saudi office established in Jeddah",
    ar: "افتتاح المكتب السعودي الثاني في جدة",
  },
];

const heroMilestones = [
  milestones[1],
  milestones[3],
  milestones[5],
  milestones[10],
];

const leaders = [
  {
    name: { en: "Dr. Omar El Husseiny", ar: "د. عمر الحسيني" },
    role: {
      en: "Co-Founder & Co-CEO",
      ar: "الشريك المؤسس والرئيس التنفيذي المشارك",
    },
    text: {
      en: "Prof. Omar El Husseiny, Co-Founder of BECT, brings nearly 40 years of distinguished experience in architecture and urban design. After earning his MSc and PhD in France, he returned to Egypt and built a notable career leading large-scale projects from master planning to execution. His expertise spans architectural design, urban development, and comprehensive project management.",
      ar: "يمتلك الأستاذ الدكتور عمر الحسيني ما يقارب أربعة عقود من الخبرة المتميزة في العمارة والتصميم الحضري. بعد حصوله على درجتي الماجستير والدكتوراه من فرنسا، عاد إلى مصر وقاد مشروعات كبرى من التخطيط العام حتى التنفيذ. وتشمل خبراته التصميم المعماري والتطوير الحضري والإدارة المتكاملة للمشروعات.",
    },
  },
  {
    name: { en: "Dr. Osama El Husseiny", ar: "د. أسامة الحسيني" },
    role: {
      en: "Co-Founder & Co-CEO",
      ar: "الشريك المؤسس والرئيس التنفيذي المشارك",
    },
    text: {
      en: "Prof. Ossama has successfully balanced his professional career between design and project management within the private sector and academic work at the Faculty of Engineering. He expanded his expertise during his PhD studies in France and further enriched it upon returning to Egypt, leading major projects both locally and internationally across various sectors.",
      ar: "جمع الأستاذ الدكتور أسامة الحسيني بين مسيرته المهنية في التصميم وإدارة المشروعات وعمله الأكاديمي بكلية الهندسة. وقد وسعت دراسته للدكتوراه في فرنسا خبراته التي عاد بها إلى مصر لقيادة مشروعات محلية ودولية مهمة في قطاعات متعددة.",
    },
  },
];

const principles = [
  {
    n: "01",
    en: "Integrated delivery that serves communities",
    ar: "تنفيذ متكامل يخدم المجتمعات",
  },
  {
    n: "02",
    en: "Creative concepts that turn visions into reality",
    ar: "أفكار إبداعية تحول الرؤى إلى واقع",
  },
  {
    n: "03",
    en: "Controlled quality at every project stage",
    ar: "جودة منضبطة في كل مراحل المشروع",
  },
  {
    n: "04",
    en: "Continuous improvement of people and methods",
    ar: "تطوير مستمر للكوادر والمنهجيات",
  },
  {
    n: "05",
    en: "Well-coordinated spaces shaped around purpose",
    ar: "مساحات متكاملة ومنسقة حول الهدف",
  },
];

const disciplines = [
  { icon: <ArchitectureRounded />, en: "Architecture", ar: "العمارة" },
  {
    icon: <BusinessRounded />,
    en: "Planning & Urban Design",
    ar: "التخطيط والتصميم الحضري",
  },
  { icon: <GroupsRounded />, en: "Project Management", ar: "إدارة المشروعات" },
  {
    icon: <VerifiedRounded />,
    en: "Civil & Structure",
    ar: "الهندسة المدنية والإنشائية",
  },
  { icon: <LanguageRounded />, en: "Landscape", ar: "تنسيق المواقع" },
  {
    icon: <LocationOnRounded />,
    en: "MEP & Infrastructure",
    ar: "الأعمال الكهروميكانيكية والبنية التحتية",
  },
];

const members = [
  [
    "Dr. Omar El Husseiny",
    "Co-Founder & Co-CEO",
    "د. عمر الحسيني",
    "الشريك المؤسس والرئيس التنفيذي المشارك",
  ],
  [
    "Dr. Osama El Husseiny",
    "Co-Founder & Co-CEO",
    "د. أسامة الحسيني",
    "الشريك المؤسس والرئيس التنفيذي المشارك",
  ],
  [
    "Dr. Hayssam Elhusseiny",
    "BD & Operations Director",
    "د. هيثم الحسيني",
    "مدير تطوير الأعمال والعمليات",
  ],
  [
    "Arch. Ashraf Elsawah",
    "Architectural Director",
    "م. أشرف السواح",
    "مدير القطاع المعماري",
  ],
  [
    "Eng. Rami Elhusseiny",
    "Marketing & Communications Director",
    "م. رامي الحسيني",
    "مدير التسويق والاتصالات",
  ],
  [
    "Eng. Hesham Badr",
    "Civil & Structural Director",
    "م. هشام بدر",
    "مدير القطاع المدني والإنشائي",
  ],
  [
    "Eng. Hoda Lotfi",
    "Mechanical Director",
    "م. هدى لطفي",
    "مدير القطاع الميكانيكي",
  ],
  [
    "Eng. Shaban Elkhatab",
    "Electrical Director",
    "م. شعبان الخطاب",
    "مدير القطاع الكهربائي",
  ],
  ["Arch. Galal Awad", "Projects Director", "م. جلال عوض", "مدير المشروعات"],
  [
    "Mr. Hossam El Khashab",
    "Financial & Administrative Manager",
    "أ. حسام الخشاب",
    "مدير الشؤون المالية والإدارية",
  ],
];

const memberImages = {
  "Dr. Hayssam Elhusseiny": drHayssamImage,
  "Arch. Ashraf Elsawah": archAshrafImage,
  "Eng. Rami Elhusseiny": engRamiImage,
  "Eng. Hesham Badr": engHeshamImage,
  "Eng. Hoda Lotfi": engHodaImage,
  "Eng. Shaban Elkhatab": engShabanImage,
  "Arch. Galal Awad": engGalalImage,
  "Mr. Hossam El Khashab": mrHossamImage,
};

const partners = [
  "World Bank Group",
  "European Investment Bank",
  "European Bank for Reconstruction and Development",
  "Asian Development Bank",
  "United Nations",
  "EDF",
  "SYSTRA",
  "Siemens",
  "Schneider Electric",
  "Alstom Power",
  "Alstom Transport",
  "AREP",
  "ARUP",
  "Perkins & Will",
  "Veolia",
  "Vinci Construction",
  "National Authority for Tunnels",
  "National Authority for Roads & Bridges",
  "Saudi Arabia Airlines",
  "General Electric",
  "Ministry of Housing",
  "Ministry of Health",
  "Ministry of Water & Electricity",
  "GIZ",
  "CIB",
  "Sabbour",
  "Talaat Mostafa Group",
  "Cleopatra Group",
  "Nestlé",
  "Utopia Pharmaceuticals",
];

const associates = [
  {
    name: "ARTELIA",
    logo: "/about/associates/artelia.png",
    origin: { en: "France · Global", ar: "فرنسا · عالمي" },
    text: {
      en: "A leading multidisciplinary engineering and project management group with deep expertise in mobility, water, energy, buildings, and industry.",
      ar: "مجموعة رائدة متعددة التخصصات في الهندسة وإدارة المشروعات، بخبرات واسعة في النقل والمياه والطاقة والمباني والصناعة.",
    },
  },
  {
    name: "AREP",
    logo: "/about/associates/arep.svg",
    origin: { en: "France · Mobility", ar: "فرنسا · النقل" },
    text: {
      en: "An international practice renowned for architecture, urban planning, mobility, and sustainable, people-centred public environments.",
      ar: "مكتب دولي معروف بخبراته في العمارة والتخطيط الحضري والتنقل وتصميم البيئات العامة المستدامة المتمحورة حول الإنسان.",
    },
  },
  {
    name: "DOHWA",
    logo: "/about/associates/dohwa.png",
    origin: {
      en: "South Korea · Infrastructure",
      ar: "كوريا الجنوبية · البنية التحتية",
    },
    text: {
      en: "South Korea’s largest civil engineering consultancy, delivering transportation, water, environmental, and urban development programmes worldwide.",
      ar: "أكبر شركة استشارات هندسية مدنية في كوريا الجنوبية، تنفذ برامج النقل والمياه والبيئة والتنمية الحضرية حول العالم.",
    },
  },
];

const copy = {
  en: {
    eyebrow: "About BECT",
    title: "Engineering progress,",
    accent: "with purpose.",
    intro:
      "An independent Egyptian engineering consultancy shaping complex places, systems, and infrastructure since 1989.",
    storyLabel: "Who we are",
    storyTitle: "Local intelligence. International standards.",
    storyOne:
      "Bureau Égyptien de Conseils Techniques (BECT) is an ISO 9001:2015 certified expertise house founded in Cairo in 1989, with a Saudi branch operating since 2007. We deliver architecture, planning, infrastructure, transportation, industrial, healthcare, and high-technology projects across the region.",
    storyTwo:
      "Our strength lies in assembling the right disciplines around each challenge. From early strategy and design to technical coordination, supervision, and handover, BECT combines rigorous engineering with an understanding of place, culture, and long-term value.",
    figures: "BECT at a glance",
    principles: "Principles in practice",
    principlesIntro:
      "The standards behind every decision, drawing, and delivery.",
    journey: "A practice shaped over time",
    leadership: "Our CEO's",
    leadershipIntro:
      "Two careers spanning design, academia, urban development, and the delivery of complex projects.",
    associates: "International associates",
    associatesIntro:
      "Longstanding collaboration extends our perspective and delivery capacity.",
    organization: "The people behind the practice",
    organizationIntro:
      "A multidisciplinary leadership team connecting management, design, engineering, and delivery.",
    footprint: "Two offices. One connected practice.",
    cairo: "Cairo Head Office",
    cairoAddress: "17 Minuf St., Heliopolis, Cairo, Egypt",
    riyadh: "Riyadh Global Office",
    riyadhAddress: "6071 King Abdelaziz Rd., Al Maseef District, Riyadh, KSA",
    network: "A network built through delivery",
    networkIntro:
      "Selected institutions, clients, consultants, and delivery partners we have worked alongside.",
    cta: "Build the next chapter with us.",
    ctaText:
      "Bring your ambition, complexity, and context. We will bring the right team.",
    ctaButton: "Start a conversation",
    founded: "Founded",
    projects: "Projects delivered",
    people: "Professionals",
    countries: "Countries",
    offices: "International offices",
    certified: "ISO 9001:2015",
  },
  ar: {
    eyebrow: "عن BECT",
    title: "نهندس التقدم،",
    accent: "بهدف واضح.",
    intro:
      "بيت خبرة هندسي مصري مستقل يصوغ الأماكن والأنظمة والبنية التحتية المعقدة منذ عام 1989.",
    storyLabel: "من نحن",
    storyTitle: "فهم محلي. معايير دولية.",
    storyOne:
      "المكتب المصري للاستشارات الفنية BECT هو بيت خبرة معتمد وفق ISO 9001:2015، تأسس في القاهرة عام 1989، ويعمل فرعه في المملكة العربية السعودية منذ عام 2007. نقدم خدمات العمارة والتخطيط والبنية التحتية والنقل والمشروعات الصناعية والصحية وعالية التقنية في المنطقة.",
    storyTwo:
      "تكمن قوتنا في جمع التخصصات المناسبة حول كل تحدٍ. فمن الاستراتيجية والتصميم إلى التنسيق الفني والإشراف والتسليم، تجمع BECT بين الدقة الهندسية وفهم المكان والثقافة والقيمة طويلة الأجل.",
    figures: "BECT في أرقام",
    principles: "مبادئ نطبقها",
    principlesIntro: "المعايير التي تقف خلف كل قرار ورسم وتسليم.",
    journey: "خبرة تشكلت عبر الزمن",
    leadership: "قيادة برؤية بعيدة",
    leadershipIntro:
      "مسيرتان تجمعان التصميم والعمل الأكاديمي والتطوير الحضري وتنفيذ المشروعات المعقدة.",
    expertise: "منظومة واحدة متكاملة",
    expertiseIntro: "فرق متخصصة تجمعها ثقافة مشروع واحدة.",
    associates: "الشركاء الدوليون",
    associatesIntro: "شراكات ممتدة توسع رؤيتنا وقدرتنا على التنفيذ.",
    organization: "فريق يقود الممارسة",
    organizationIntro:
      "قيادة متعددة التخصصات تربط الإدارة والتصميم والهندسة والتنفيذ.",
    footprint: "مكتبان. منظومة واحدة مترابطة.",
    cairo: "المكتب الرئيسي بالقاهرة",
    cairoAddress: "17 شارع المنوفية، مصر الجديدة، القاهرة، مصر",
    riyadh: "المكتب العالمي بالرياض",
    riyadhAddress: "6071 طريق الملك عبدالعزيز، حي المصيف، الرياض، السعودية",
    network: "شبكة بنتها المشروعات",
    networkIntro:
      "مجموعة مختارة من المؤسسات والعملاء والاستشاريين وشركاء التنفيذ الذين عملنا معهم.",
    cta: "لنصنع الفصل القادم معاً.",
    ctaText: "أحضر طموحك وتعقيد مشروعك وسياقه، وسنكوّن له الفريق المناسب.",
    ctaButton: "ابدأ محادثة",
    founded: "سنة التأسيس",
    projects: "مشروعاً منجزاً",
    people: "متخصصاً",
    countries: "دولة",
    offices: "مكتبان دوليان",
    certified: "ISO 9001:2015",
  },
};

function AboutPage({ language = "en", onContactClick }) {
  const [activeMilestone, setActiveMilestone] = useState(milestones.length - 1);
  const [activeLeader, setActiveLeader] = useState(0);
  const [activeAssociate, setActiveAssociate] = useState(0);
  const isArabic = language === "ar";
  const text = copy[language];
  const showPreviousLeader = () => {
    setActiveLeader((current) => (current + leaders.length - 1) % leaders.length);
  };
  const showNextLeader = () => {
    setActiveLeader((current) => (current + 1) % leaders.length);
  };
  const showPreviousAssociate = () => {
    setActiveAssociate((current) => (current + associates.length - 1) % associates.length);
  };
  const showNextAssociate = () => {
    setActiveAssociate((current) => (current + 1) % associates.length);
  };

  return (
    <Box component="main" className="about-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="about-hero">
        <Container maxWidth="xl" className="about-shell about-hero-grid">
          <Box className="about-hero-copy">
            <Typography className="about-kicker">{text.eyebrow}</Typography>
            <Typography component="h1">
              {text.title}
              <br />
              <span>{text.accent}</span>
            </Typography>
            <Typography className="about-hero-intro">{text.intro}</Typography>
          </Box>
          <Box className="about-hero-visual">
            <Box className="about-engineering-board" aria-hidden="true">
              <Box className="about-board-header">
                <span>BECT / TECHNICAL OFFICE</span>
                <strong>Integrated engineering</strong>
              </Box>
              <svg
                className="about-engineering-drawing"
                viewBox="0 0 760 560"
                role="presentation"
              >
                <defs>
                  <linearGradient id="aboutBeamGradient" x1="0" x2="1">
                    <stop offset="0" stopColor="#77d0ed" stopOpacity=".2" />
                    <stop offset=".48" stopColor="#77d0ed" stopOpacity=".9" />
                    <stop offset="1" stopColor="#cf876f" stopOpacity=".9" />
                  </linearGradient>
                </defs>
                <g className="drawing-grid">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <path
                      key={`v-${index}`}
                      d={`M${92 + index * 82} 42 V520`}
                    />
                  ))}
                  {Array.from({ length: 6 }).map((_, index) => (
                    <path
                      key={`h-${index}`}
                      d={`M54 ${82 + index * 78} H705`}
                    />
                  ))}
                </g>
                <g className="drawing-tower">
                  <path d="M210 454 L286 116 L362 454 Z" />
                  <path d="M244 304 H328 M230 372 H342 M264 214 H308" />
                  <path d="M210 454 L328 304 L286 116 L244 304 L362 454" />
                  <path d="M179 454 H394" />
                </g>
                <g className="drawing-bridge">
                  <path d="M382 352 C455 270 548 266 626 352" />
                  <path d="M392 352 H682" />
                  <path d="M424 352 V314 M474 352 V287 M524 352 V279 M574 352 V303 M624 352 V348" />
                </g>
                <g className="drawing-network">
                  <path d="M122 168 C190 96 288 76 388 112 C495 151 552 91 645 122" />
                  <path d="M124 168 L214 454 M388 112 L524 352 M645 122 L682 352" />
                  <circle cx="122" cy="168" r="10" />
                  <circle cx="388" cy="112" r="10" />
                  <circle cx="645" cy="122" r="10" />
                  <circle cx="524" cy="352" r="10" />
                </g>
                <g className="drawing-measurements">
                  <path d="M118 502 H641" />
                  <path d="M118 490 V514 M641 490 V514" />
                  <path d="M90 116 V454" />
                  <path d="M78 116 H102 M78 454 H102" />
                </g>
              </svg>
              <Box className="about-engineering-chip chip-architecture">
                ARCH
              </Box>
              <Box className="about-engineering-chip chip-structure">
                STRUCTURE
              </Box>
              <Box className="about-engineering-chip chip-mep">MEP</Box>
              <Box className="about-engineering-chip chip-infra">INFRA</Box>
              <Box className="about-engineering-stamp">
                <span>ISO</span>
                <strong>9001</strong>
              </Box>
            </Box>
            <Typography className="about-journey-note">
              {isArabic
                ? "رحلة مستمرة من الفكرة إلى الأثر"
                : "a journey from ideas to impact"}
            </Typography>
            <svg
              className="about-hero-route"
              viewBox="0 0 760 560"
              role="presentation"
            >
              <path
                className="route-shadow"
                d="M718 82 C628 113 635 214 574 283 C488 380 494 249 405 202 C315 155 318 346 225 350 C116 354 142 475 44 492"
              />
              <path
                className="route-main"
                pathLength="1"
                d="M718 82 C628 113 635 214 574 283 C488 380 494 249 405 202 C315 155 318 346 225 350 C116 354 142 475 44 492"
              />
              <path className="route-arrow" d="M64 475 L40 493 L68 501" />
              <g className="route-markers">
                <circle cx="574" cy="283" r="10" />
                <circle cx="574" cy="283" r="4" />
                <circle cx="405" cy="202" r="10" />
                <circle cx="405" cy="202" r="4" />
                <circle cx="317" cy="257" r="10" />
                <circle cx="317" cy="257" r="4" />
                <circle cx="225" cy="350" r="10" />
                <circle cx="225" cy="350" r="4" />
              </g>
            </svg>
            <Box className="about-route-endpoint endpoint-from">
              <span>{isArabic ? "من" : "From"}</span>
              <strong>1989</strong>
            </Box>
            {heroMilestones.map((item, index) => (
              <Box
                key={item.year}
                className={`about-hero-milestone hero-stop-${index + 1}`}
              >
                <strong>{item.year}</strong>
                <Typography>{item[language]}</Typography>
              </Box>
            ))}
            <Box className="about-route-endpoint endpoint-to">
              <span>{isArabic ? "إلى" : "To"}</span>
              <strong>2025</strong>
            </Box>
          </Box>
        </Container>
        <Container maxWidth="xl" className="about-shell about-stat-rail">
          {[
            ["1989", text.founded],
            ["800+", text.projects],
            ["300+", text.people],
            ["16", text.countries],
            ["02", text.offices],
            ["ISO", text.certified],
          ].map(([value, label]) => (
            <Box key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </Box>
          ))}
        </Container>
      </section>

      <section className="about-story">
        <Container maxWidth="xl" className="about-shell about-story-grid">
          <Box>
            <Typography className="about-section-index">
              01 / {text.storyLabel}
            </Typography>
            <Typography component="h2">
              {isArabic ? "فهم محلي." : "Local intelligence."}
              <Box component="span" className="about-story-title-accent">
                {isArabic ? "معايير دولية." : "International standards."}
              </Box>
            </Typography>
          </Box>
          <Box className="about-story-copy">
            <Typography>{text.storyOne}</Typography>
            <Typography>{text.storyTwo}</Typography>
          </Box>
        </Container>
      </section>

      <section className="about-leadership">
        <Container maxWidth="xl" className="about-shell">
          <Box className="about-leadership-heading">
            <Typography className="about-section-index">
              02 / Leadership & Team
            </Typography>
            <Typography component="h2">{text.leadership}</Typography>
            <Typography>{text.leadershipIntro}</Typography>
          </Box>
          <Box
            className="about-leadership-stage"
            style={{ "--active-leader": activeLeader }}
          >
            <Box className="about-leadership-portrait">
              <Box
                component="img"
                src="/about/co-ceos.png"
                alt={`${leaders[0].name[language]} & ${leaders[1].name[language]}`}
              />
            </Box>
            <Box className="about-leader-slider" aria-live="polite">
              <Box className="about-leader-track">
                {leaders.map((leader, index) => (
                  <Box
                    key={leader.name.en}
                    className={`about-leader-note ${
                      activeLeader === index ? "is-active" : ""
                    }`}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <Typography component="h3">
                      {leader.name[language]}
                    </Typography>
                    <Typography className="about-leader-role">
                      {leader.role[language]}
                    </Typography>
                    <Typography>{leader.text[language]}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box className="about-leader-controls">
              <button
                type="button"
                onClick={isArabic ? showNextLeader : showPreviousLeader}
                aria-label={isArabic ? "Next leader" : "Previous leader"}
              >
                {isArabic ? (
                  <ArrowForwardRounded fontSize="small" />
                ) : (
                  <ArrowBackRounded fontSize="small" />
                )}
              </button>
              <Box className="about-leader-dots" role="tablist" aria-label="Leadership slides">
                {leaders.map((leader, index) => (
                  <button
                    key={leader.name.en}
                    type="button"
                    className={activeLeader === index ? "is-active" : ""}
                    onClick={() => setActiveLeader(index)}
                    aria-label={`Show ${leader.name[language]}`}
                    aria-selected={activeLeader === index}
                  />
                ))}
              </Box>
              <button
                type="button"
                onClick={isArabic ? showPreviousLeader : showNextLeader}
                aria-label={isArabic ? "Previous leader" : "Next leader"}
              >
                {isArabic ? (
                  <ArrowBackRounded fontSize="small" />
                ) : (
                  <ArrowForwardRounded fontSize="small" />
                )}
              </button>
            </Box>
          </Box>

          <Box className="about-leadership-team">
            <Typography className="about-section-index">
              {text.organization}
            </Typography>
            <Typography>{text.organizationIntro}</Typography>
          </Box>
          <Box className="about-member-list">
            {members.slice(2).map((member, index) => (
              <Box key={member[0]}>
                <span>{String(index + 3).padStart(2, "0")}</span>
                <Box className="about-member-photo">
                  <Box
                    component="img"
                    src={memberImages[member[0]]}
                    alt={isArabic ? member[2] : member[0]}
                  />
                </Box>
                <Box>
                  <Typography component="h3">
                    {isArabic ? member[2] : member[0]}
                  </Typography>
                  <Typography>{isArabic ? member[3] : member[1]}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </section>

      <section className="about-principles">
        <Container maxWidth="xl" className="about-shell">
          <Box className="about-section-heading">
            <Typography className="about-section-index">
              03 / {text.figures}
            </Typography>
            <Typography component="h2">{text.principles}</Typography>
            <Typography>{text.principlesIntro}</Typography>
          </Box>
          <Box className="about-principle-grid">
            {principles.map((item) => (
              <Box key={item.n}>
                <span>{item.n}</span>
                <Typography component="h3">{item[language]}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </section>

      {/* <section className="about-journey">
        <Container maxWidth="xl" className="about-shell">
          <Box className="about-journey-heading">
            <Box>
              <Typography className="about-section-index">04 / 1989—2025</Typography>
              <Typography component="h2">{text.journey}</Typography>
            </Box>
            <Box className="about-journey-feature" key={activeMilestone}>
              <strong>{milestones[activeMilestone].year}</strong>
              <Typography>{milestones[activeMilestone][language]}</Typography>
            </Box>
          </Box>
          <Box className="about-milestone-track">
            {milestones.map((item, index) => (
              <button
                type="button"
                key={item.year}
                className={index === activeMilestone ? 'is-active' : ''}
                onClick={() => setActiveMilestone(index)}
              >
                <span>{item.year}</span>
                <i />
                <small>{item[language]}</small>
              </button>
            ))}
          </Box>
        </Container>
      </section> */}

      <section className="about-associates">
        <Container maxWidth="xl" className="about-shell">
          <Box className="about-section-heading about-section-heading-light">
            <Typography className="about-section-index">
              06 / Global network
            </Typography>
            <Typography component="h2">{text.associates}</Typography>
            <Typography>{text.associatesIntro}</Typography>
          </Box>
          <Box
            className="about-associate-stage"
            style={{ "--active-associate": activeAssociate }}
          >
            <Box className="about-associate-grid" aria-live="polite">
              {associates.map((associate, index) => (
                <Box
                  key={associate.name}
                  className={activeAssociate === index ? "is-active" : ""}
                  style={{ "--associate-logo": `url("${associate.logo}")` }}
                >
                  <span>0{index + 1}</span>
                  <Typography component="h3">{associate.name}</Typography>
                  <Typography className="about-associate-origin">
                    {associate.origin[language]}
                  </Typography>
                  <Typography>{associate.text[language]}</Typography>
                </Box>
              ))}
            </Box>
            <Box className="about-associate-controls">
              <button
                type="button"
                onClick={isArabic ? showNextAssociate : showPreviousAssociate}
                aria-label={isArabic ? "Next associate" : "Previous associate"}
              >
                {isArabic ? (
                  <ArrowForwardRounded fontSize="small" />
                ) : (
                  <ArrowBackRounded fontSize="small" />
                )}
              </button>
              <Box className="about-associate-dots" role="tablist" aria-label="Associate slides">
                {associates.map((associate, index) => (
                  <button
                    key={associate.name}
                    type="button"
                    className={activeAssociate === index ? "is-active" : ""}
                    onClick={() => setActiveAssociate(index)}
                    aria-label={`Show ${associate.name}`}
                    aria-selected={activeAssociate === index}
                  />
                ))}
              </Box>
              <button
                type="button"
                onClick={isArabic ? showPreviousAssociate : showNextAssociate}
                aria-label={isArabic ? "Previous associate" : "Next associate"}
              >
                {isArabic ? (
                  <ArrowBackRounded fontSize="small" />
                ) : (
                  <ArrowForwardRounded fontSize="small" />
                )}
              </button>
            </Box>
          </Box>
        </Container>
      </section>

      <section className="about-offices">
        <Container maxWidth="xl" className="about-shell">
          <Box className="about-offices-heading">
            <Typography className="about-section-index">
              07 / Locations
            </Typography>
            <Typography component="h2">{text.footprint}</Typography>
          </Box>
          <Box className="about-office-grid">
            <Box>
              <span>30.0444° N · 31.2357° E</span>
              <Typography component="h3">{text.cairo}</Typography>
              <Typography>{text.cairoAddress}</Typography>
              <Typography>+20 (02) 24187866</Typography>
            </Box>
            <Box>
              <span>24.7136° N · 46.6753° E</span>
              <Typography component="h3">{text.riyadh}</Typography>
              <Typography>{text.riyadhAddress}</Typography>
              <Typography>+966 014535135</Typography>
            </Box>
          </Box>
        </Container>
      </section>

      <section className="about-network">
        <Container maxWidth="xl" className="about-shell">
          <Box className="about-network-heading">
            <Typography className="about-section-index">
              08 / Partners
            </Typography>
            <Typography component="h2">{text.network}</Typography>
            <Typography>{text.networkIntro}</Typography>
          </Box>
          <Box className="about-network-carousel">
            <PartnerLogoCarousel language={language} />
          </Box>
        </Container>
      </section>
    </Box>
  );
}

export default AboutPage;
