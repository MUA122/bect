import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Container, Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import ArrowOutwardRounded from '@mui/icons-material/ArrowOutwardRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import PublicRounded from '@mui/icons-material/PublicRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { projectCategories, projects } from '../data/projects';
import './ProjectsPage.css';

const copy = {
  en: {
    eyebrow: 'BECT project atlas',
    title: 'Work that moves',
    accent: 'places forward.',
    intro: 'A living archive of places, systems, and infrastructure shaped across regions, scales, and disciplines.',
    metricProjects: 'projects in the portfolio',
    metricCategories: 'connected fields',
    atlasNote: 'Built across borders',
    atlasLabel: 'Selected project atlas',
    legend: 'Follow the Colors',
    legendIntro: 'A quick color key for the portfolio.',
    legendNote: 'portfolio key',
    filterTitle: 'Explore the full archive',
    all: 'All projects',
    allLocations: 'All locations',
    allYears: 'All dates',
    location: 'Location',
    date: 'Date',
    search: 'Search by project, place, or keyword',
    clear: 'Clear filters',
    showing: 'Showing',
    of: 'of',
    results: 'projects',
    noResults: 'No projects match these filters.',
    reset: 'Reset the view',
    view: 'View project',
    close: 'Close project details',
    status: 'Project date',
    value: 'Construction value',
    loadMore: 'Load more projects',
    allLoaded: 'All matching projects are displayed',
  },
  ar: {
    eyebrow: 'أطلس مشروعات BECT',
    title: 'أعمال تدفع',
    accent: 'الأماكن إلى الأمام.',
    intro: 'أرشيف حي للأماكن والأنظمة والبنية التحتية التي صممناها عبر مناطق ومقاييس وتخصصات متعددة.',
    metricProjects: 'مشروعاً في محفظة الأعمال',
    metricCategories: 'مجالات مترابطة',
    atlasNote: 'نبني عبر الحدود',
    atlasLabel: 'أطلس المشروعات المختارة',
    legend: 'اتبع اللون',
    legendIntro: 'يمثل كل شريط مجالاً من مجالات المشروعات. اختر أحدها لتتبع أعماله داخل الأرشيف.',
    legendNote: 'اختر شريطاً',
    filterTitle: 'استكشف الأرشيف الكامل',
    all: 'كل المشروعات',
    allLocations: 'كل المواقع',
    allYears: 'كل التواريخ',
    location: 'الموقع',
    date: 'التاريخ',
    search: 'ابحث بالمشروع أو الموقع أو كلمة مفتاحية',
    clear: 'مسح الفلاتر',
    showing: 'عرض',
    of: 'من',
    results: 'مشروعاً',
    noResults: 'لا توجد مشروعات تطابق هذه الفلاتر.',
    reset: 'إعادة ضبط العرض',
    view: 'عرض المشروع',
    close: 'إغلاق تفاصيل المشروع',
    status: 'تاريخ المشروع',
    value: 'قيمة الإنشاء',
    loadMore: 'عرض المزيد من المشروعات',
    allLoaded: 'تم عرض كل المشروعات المطابقة',
  },
};

const localize = (value, language) => (
  typeof value === 'object' && value !== null ? value[language] || value.en : value
);

const localizeProject = (project, field, language) => (
  language === 'ar'
    ? project.translations?.ar?.[field] || project[field]
    : project[field]
);

function CountryFlag({ code }) {
  const commonProps = {
    className: 'country-flag',
    viewBox: '0 0 24 16',
    role: 'img',
    'aria-label': `${code} flag`,
  };

  if (code === 'EG') {
    return (
      <svg {...commonProps}>
        <rect width="24" height="16" rx="2" fill="#fff" />
        <path d="M0 0h24v5.33H0z" fill="#ce1126" />
        <path d="M0 10.67h24V16H0z" fill="#111" />
        <path d="m12 6.1 1.15 1.05-.42 2.05h-1.46l-.42-2.05L12 6.1Z" fill="#c79b2b" />
      </svg>
    );
  }

  if (code === 'IQ') {
    return (
      <svg {...commonProps}>
        <rect width="24" height="16" rx="2" fill="#fff" />
        <path d="M0 0h24v5.33H0z" fill="#ce1126" />
        <path d="M0 10.67h24V16H0z" fill="#111" />
        <path d="M8 8h8" stroke="#168a45" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="10" cy="8" r=".8" fill="#168a45" />
        <circle cx="14" cy="8" r=".8" fill="#168a45" />
      </svg>
    );
  }

  if (code === 'OM') {
    return (
      <svg {...commonProps}>
        <rect width="24" height="16" rx="2" fill="#fff" />
        <path d="M0 5.33h24v5.34H0z" fill="#d9272e" />
        <path d="M0 10.67h24V16H0z" fill="#00843d" />
        <path d="M0 0h6.2v16H0z" fill="#d9272e" />
        <path d="M1.7 2.1h2.8M2.1 1.4l2 2.1M4.1 1.4l-2 2.1" stroke="#fff" strokeWidth=".55" strokeLinecap="round" />
      </svg>
    );
  }

  if (code === 'SA') {
    return (
      <svg {...commonProps}>
        <rect width="24" height="16" rx="2" fill="#006c35" />
        <path d="M6.5 6.2h11M7.5 8h9" stroke="#fff" strokeWidth=".75" strokeLinecap="round" />
        <path d="M7 11.2h9.5l1-1" fill="none" stroke="#fff" strokeWidth=".9" strokeLinecap="round" />
      </svg>
    );
  }

  if (code === 'ZM') {
    return (
      <svg {...commonProps}>
        <rect width="24" height="16" rx="2" fill="#198a00" />
        <path d="M17 8h2.33v8H17z" fill="#ef3340" />
        <path d="M19.33 8h2.34v8h-2.34z" fill="#111" />
        <path d="M21.67 8H24v8h-2.33z" fill="#f77f00" />
        <path d="m19.3 4.3 1.4-1.2 1.4 1.2-1.4-.25-1.4.25Z" fill="#f77f00" />
      </svg>
    );
  }

  return <span className="country-flag-fallback">{code}</span>;
}

const featuredProjectPages = [18, 50, 61, 79, 88, 70, 40, 53, 91, 25, 85, 71];

function CategoryMark({ category }) {
  return (
    <span className="projects-category-mark" style={{ '--category': category.color }} aria-hidden="true">
      <i />
      <b>{category.code}</b>
    </span>
  );
}

function PremiumSelect({ label, value, options, onChange, type = 'date' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className={`premium-select ${open ? 'is-open' : ''}`}>
      <button type="button" className="premium-select-trigger" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <span className="premium-select-icon">
          {type === 'location' ? (selected.code ? <CountryFlag code={selected.code} /> : <PublicRounded />) : <CalendarMonthRounded />}
        </span>
        <span className="premium-select-copy">
          <small>{label}</small>
          <strong>{selected.label}</strong>
        </span>
        <KeyboardArrowDownRounded className="premium-select-chevron" />
      </button>
      <div className="premium-select-menu" role="listbox">
        <div className="premium-select-menu-line" />
        {options.map((option) => (
          <button
            type="button"
            role="option"
            aria-selected={option.value === value}
            key={option.value}
            className={option.value === value ? 'is-selected' : ''}
            onClick={() => {
              onChange(option.value);
              setOpen(false);
            }}
          >
            <span className="premium-option-icon">
              {type === 'location' ? (option.code ? <CountryFlag code={option.code} /> : <PublicRounded />) : <i />}
            </span>
            <span>{option.label}</span>
            {option.meta && <small>{option.meta}</small>}
            <CheckRounded />
          </button>
        ))}
      </div>
    </div>
  );
}

function ProjectsPage({ language = 'en', onContactClick }) {
  const [category, setCategory] = useState('all');
  const [country, setCountry] = useState('all');
  const [year, setYear] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const text = copy[language];
  const isArabic = language === 'ar';

  const categoryCounts = useMemo(
    () => Object.fromEntries(projectCategories.map((item) => [
      item.id,
      projects.filter((project) => project.category === item.id).length,
    ])),
    [],
  );

  const countryOptions = useMemo(() => {
    const countries = [...new Map(projects.map((project) => [
      project.country,
      {
        value: project.country,
        label: localizeProject(project, 'country', language),
        code: project.countryCode,
      },
    ])).values()].sort((a, b) => a.label.localeCompare(b.label));
    return [{ value: 'all', label: text.allLocations, code: '' }, ...countries];
  }, [language, text.allLocations]);

  const yearOptions = useMemo(() => {
    const yearLabels = new Map(projects.map((project) => [
      project.year,
      localizeProject(project, 'year', language),
    ]));
    const years = [...yearLabels.keys()].sort((a, b) => {
      if (a === 'In progress') return -1;
      if (b === 'In progress') return 1;
      if (a.startsWith('Expected')) return -1;
      if (b.startsWith('Expected')) return 1;
      return (Number.parseInt(b, 10) || 0) - (Number.parseInt(a, 10) || 0);
    });
    return [
      { value: 'all', label: text.allYears },
      ...years.map((item) => ({
        value: item,
        label: yearLabels.get(item),
      })),
    ];
  }, [language, text.allYears]);

  const curatedProjects = useMemo(() => {
    const featured = featuredProjectPages
      .map((page) => projects.find((project) => project.sourcePage === page))
      .filter(Boolean);
    const featuredIds = new Set(featured.map((project) => project.id));
    const categoryPools = Object.fromEntries(
      projectCategories.map((item) => [
        item.id,
        projects.filter(
          (project) => project.category === item.id && !featuredIds.has(project.id)
        ),
      ])
    );
    const mixedRemainder = [];
    let hasProjects = true;

    while (hasProjects) {
      hasProjects = false;
      projectCategories.forEach((item) => {
        const nextProject = categoryPools[item.id].shift();
        if (nextProject) {
          mixedRemainder.push(nextProject);
          hasProjects = true;
        }
      });
    }

    return [...featured, ...mixedRemainder];
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    const isDefaultView = category === 'all'
      && country === 'all'
      && year === 'all'
      && !search;
    const sourceProjects = isDefaultView ? curatedProjects : projects;

    return sourceProjects.filter((project) => {
      const matchesSearch = !search || [
        project.name,
        project.location,
        project.description,
        project.value,
        localizeProject(project, 'name', language),
        localizeProject(project, 'location', language),
        localizeProject(project, 'description', language),
        localizeProject(project, 'value', language),
      ].join(' ').toLocaleLowerCase().includes(search);
      return matchesSearch
        && (category === 'all' || project.category === category)
        && (country === 'all' || project.country === country)
        && (year === 'all' || project.year === year);
    });
  }, [category, country, curatedProjects, language, query, year]);

  useEffect(() => setVisibleCount(12), [category, country, query, year]);

  const heroProjects = [
    projects.find((project) => project.sourcePage === 18),
    projects.find((project) => project.sourcePage === 50),
    projects.find((project) => project.sourcePage === 79),
  ];

  const clearFilters = () => {
    setCategory('all');
    setCountry('all');
    setYear('all');
    setQuery('');
  };

  return (
    <Box component="main" className="projects-page" dir={isArabic ? 'rtl' : 'ltr'}>
      <Box className="projects-hero">
        <Container maxWidth="xl" className="projects-shell">
          <Box className="projects-hero-grid">
            <Box className="projects-hero-copy">
              <Typography className="projects-eyebrow">{text.eyebrow}</Typography>
              <Typography component="h1" className="projects-title">
                {text.title} <Box component="span">{text.accent}</Box>
              </Typography>
              <Typography className="projects-intro">{text.intro}</Typography>
              <a href="#projects-collection" className="projects-hero-link">
                <span>{text.filterTitle}</span><ArrowOutwardRounded />
              </a>
            </Box>

            <Box className="projects-atlas" aria-hidden="true">
              <Box className="projects-atlas-blueprint" />
              <Box className="projects-atlas-card projects-atlas-card-main">
                <img src={heroProjects[0].image} alt="" />
                <span>01</span>
                <b>{heroProjects[0].name}</b>
              </Box>
              <Box className="projects-atlas-card projects-atlas-card-water">
                <img src={heroProjects[1].image} alt="" />
                <span>02</span>
              </Box>
              <Box className="projects-atlas-card projects-atlas-card-industry">
                <img src={heroProjects[2].image} alt="" />
                <span>03</span>
              </Box>
              <Box className="projects-atlas-stamp">
                <strong>{projects.length}</strong>
                <span>PROJECT<br />STORIES</span>
              </Box>
              <Typography className="projects-atlas-hand">{text.atlasNote}</Typography>
              <svg className="projects-atlas-sketch" viewBox="0 0 230 130" fill="none">
                <path d="M8 104C52 122 78 54 123 71c32 12 40 43 99 13" />
                <path d="m208 75 15 9-12 12" />
              </svg>
              <Box className="projects-atlas-caption">{text.atlasLabel} / 2026</Box>
            </Box>
          </Box>

          <Box className="projects-hero-metrics">
            <Box><strong>{projects.length}</strong><span>{text.metricProjects}</span></Box>
            <Box><strong>{projectCategories.length}</strong><span>{text.metricCategories}</span></Box>
          </Box>
        </Container>
      </Box>

      <Box className="projects-workspace" id="projects-collection">
        <Container maxWidth="xl" className="projects-shell">
          <section className="projects-color-key" aria-labelledby="projects-legend-title">
            <Box className="projects-color-key-heading">
              <Typography className="projects-color-key-note">{text.legendNote}</Typography>
              <Typography id="projects-legend-title" component="h2">{text.legend}</Typography>
              <Typography>{text.legendIntro}</Typography>
            </Box>
            <Box className="projects-color-key-list">
              {projectCategories.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={category === item.id ? 'is-active' : ''}
                  style={{ '--category': item.color }}
                  onClick={() => setCategory(category === item.id ? 'all' : item.id)}
                  aria-pressed={category === item.id}
                >
                  <i aria-hidden="true" />
                  <span>{item.label[language]}</span>
                  <small>{categoryCounts[item.id]} {isArabic ? 'مشروع' : 'projects'}</small>
                </button>
              ))}
            </Box>
          </section>

          <section className="projects-filter-panel" aria-labelledby="projects-filter-title">
            <Box className="projects-filter-heading">
              <Box>
                <Typography className="projects-filter-kicker">{text.eyebrow}</Typography>
                <Typography id="projects-filter-title" component="h2">{text.filterTitle}</Typography>
              </Box>
              <Typography>{text.showing} <strong>{Math.min(visibleCount, filtered.length)}</strong> {text.of} {filtered.length} {text.results}</Typography>
            </Box>

            <Box className="projects-category-tabs">
              <button type="button" className={category === 'all' ? 'is-active' : ''} onClick={() => setCategory('all')}>
                {text.all}
              </button>
              {projectCategories.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={category === item.id ? 'is-active' : ''}
                  style={{ '--category': item.color }}
                  onClick={() => setCategory(item.id)}
                >
                  <i />{item.label[language]}<small>{categoryCounts[item.id]}</small>
                </button>
              ))}
            </Box>

            <Box className="projects-filter-row">
              <label className="projects-search">
                <SearchRounded />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.search} />
              </label>
              <PremiumSelect
                label={text.location}
                value={country}
                options={countryOptions}
                onChange={setCountry}
                type="location"
              />
              <PremiumSelect
                label={text.date}
                value={year}
                options={yearOptions}
                onChange={setYear}
              />
              <button type="button" className="projects-clear" onClick={clearFilters}>{text.clear}</button>
            </Box>
          </section>

          {filtered.length ? (
            <>
              <Box className="projects-grid">
                {filtered.slice(0, visibleCount).map((project, index) => {
                  const itemCategory = projectCategories.find((item) => item.id === project.category);
                  const projectName = localizeProject(project, 'name', language);
                  const projectLocation = localizeProject(project, 'location', language);
                  const projectYear = localizeProject(project, 'year', language);
                  const projectDescription = localizeProject(project, 'description', language);
                  return (
                    <article
                      key={project.id}
                      className="project-card"
                      style={{ '--category': itemCategory.color, '--card-index': index % 12 }}
                      onClick={() => setSelected(project)}
                    >
                      <Box className="project-card-visual">
                        <img src={project.image} alt={projectName} loading={index > 3 ? 'lazy' : 'eager'} />
                        <Box className="project-card-shade" />
                        <Box className="project-card-number">{String(index + 1).padStart(2, '0')}</Box>
                        <Box className="project-card-badge"><CategoryMark category={itemCategory} />{itemCategory.label[language]}</Box>
                        <button type="button" className="project-card-open" aria-label={`${text.view}: ${projectName}`}>
                          <ArrowOutwardRounded />
                        </button>
                      </Box>
                      <Box className="project-card-body">
                        <Box className="project-card-meta">
                          <span><CountryFlag code={project.countryCode} />{projectLocation}</span><i /><span>{projectYear}</span>
                        </Box>
                        <Typography component="h3">{projectName}</Typography>
                        <Typography>{projectDescription}</Typography>
                        <span className="project-card-link">{text.view}<ArrowOutwardRounded /></span>
                      </Box>
                    </article>
                  );
                })}
              </Box>
              <Box className="projects-load-more">
                {visibleCount < filtered.length ? (
                  <button type="button" onClick={() => setVisibleCount((count) => count + 12)}>
                    <span>{text.loadMore}</span>
                    <b>{Math.min(12, filtered.length - visibleCount)}</b>
                    <ArrowOutwardRounded />
                  </button>
                ) : (
                  <Typography>{text.allLoaded}</Typography>
                )}
              </Box>
            </>
          ) : (
            <Box className="projects-empty">
              <span>00</span>
              <Typography component="h3">{text.noResults}</Typography>
              <Button onClick={clearFilters}>{text.reset}</Button>
            </Box>
          )}

          <Box className="projects-contact">
            <Box>
              <Typography component="h2">{isArabic ? 'لنصنع مشروعك القادم.' : 'Let’s shape your next project.'}</Typography>
              <Typography>{isArabic ? 'يجمع فريقنا التخصصات المناسبة منذ الفكرة وحتى التنفيذ.' : 'Bring the right disciplines together, from first idea through delivery.'}</Typography>
            </Box>
            <Button onClick={onContactClick} endIcon={<ArrowOutwardRounded />}>
              {isArabic ? 'ابدأ محادثة' : 'Start a conversation'}
            </Button>
          </Box>
        </Container>
      </Box>

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="lg"
        dir={isArabic ? 'rtl' : 'ltr'}
        PaperProps={{ className: 'project-dialog-paper' }}
      >
        {selected && (() => {
          const itemCategory = projectCategories.find((item) => item.id === selected.category);
          const projectName = localizeProject(selected, 'name', language);
          const projectLocation = localizeProject(selected, 'location', language);
          const projectYear = localizeProject(selected, 'year', language);
          const projectValue = localizeProject(selected, 'value', language);
          const projectDescription = localizeProject(selected, 'description', language);
          return (
            <DialogContent className="project-dialog-content" style={{ '--category': itemCategory.color }}>
              <IconButton className="project-dialog-close" onClick={() => setSelected(null)} aria-label={text.close}><CloseRounded /></IconButton>
              <Box className="project-dialog-image"><img src={selected.image} alt={projectName} /></Box>
              <Box className="project-dialog-copy">
                <Box className="project-dialog-badge"><CategoryMark category={itemCategory} />{itemCategory.label[language]}</Box>
                <Typography component="h2">{projectName}</Typography>
                <Typography className="project-dialog-description">{projectDescription}</Typography>
                <Box className="project-dialog-facts">
                  <Box><span>{text.location}</span><strong><CountryFlag code={selected.countryCode} />{projectLocation}</strong></Box>
                  <Box><span>{text.status}</span><strong>{projectYear}</strong></Box>
                  {selected.value && <Box><span>{text.value}</span><strong>{projectValue}</strong></Box>}
                </Box>
              </Box>
            </DialogContent>
          );
        })()}
      </Dialog>
    </Box>
  );
}

export default ProjectsPage;
