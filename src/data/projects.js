import projectRecords from './projects.json';
import projectTranslations from './projects.ar.json';

export const projectCategories = [
  { id: 'urban', code: 'UP', color: '#ff7048', label: { en: 'Urban Planning & Development', ar: 'التخطيط والتطوير العمراني' } },
  { id: 'landscape', code: 'LS', color: '#58a96b', label: { en: 'Landscape', ar: 'تنسيق المواقع' } },
  { id: 'water', code: 'WW', color: '#24a9cf', label: { en: 'Water & Wastewater', ar: 'المياه والصرف الصحي' } },
  { id: 'energy', code: 'PE', color: '#e8ad2c', label: { en: 'Power & Energy', ar: 'الطاقة والكهرباء' } },
  { id: 'healthcare', code: 'HC', color: '#df5b82', label: { en: 'Healthcare', ar: 'الرعاية الصحية' } },
  { id: 'offices', code: 'HQ', color: '#7668dc', label: { en: 'Headquarters & Offices', ar: 'المقار والمكاتب' } },
  { id: 'industrial', code: 'IN', color: '#f08a45', label: { en: 'Industrial', ar: 'المشروعات الصناعية' } },
  { id: 'transportation', code: 'TR', color: '#347cbe', label: { en: 'Transportation', ar: 'النقل والمواصلات' } },
];

export const projects = projectRecords.map((project) => ({
  ...project,
  translations: {
    ar: projectTranslations[project.id],
  },
}));
