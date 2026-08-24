import projectRecords from './projects.json';
import projectTranslations from './projects.ar.json';

export const projectCategories = [
  { id: 'urban', code: 'UL', color: '#d98a72', label: { en: 'Urban & Landscape', ar: 'التخطيط العمراني وتنسيق المواقع' } },
  { id: 'education', code: 'ED', color: '#58a96b', label: { en: 'Education', ar: 'التعليم' } },
  { id: 'commercial', code: 'CM', color: '#2d8c85', label: { en: 'Commercial', ar: 'المشروعات التجارية' } },
  { id: 'water', code: 'WW', color: '#24a9cf', label: { en: 'Water & Wastewater', ar: 'المياه والصرف الصحي' } },
  { id: 'healthcare', code: 'HC', color: '#df5b82', label: { en: 'Healthcare', ar: 'الرعاية الصحية' } },
  { id: 'offices', code: 'HQ', color: '#7668dc', label: { en: 'Headquarters & Offices', ar: 'المقار والمكاتب' } },
  { id: 'industrial', code: 'IN', color: '#8f7a5c', label: { en: 'Industrial', ar: 'المشروعات الصناعية' } },
  { id: 'transportation', code: 'TR', color: '#347cbe', label: { en: 'Transportation', ar: 'النقل والمواصلات' } },
  { id: 'historic-restoration', code: 'HR', color: '#a85f4b', label: { en: 'Historic Restoration', ar: 'الترميم التاريخي' } },
  { id: 'energy', code: 'PE', color: '#e8ad2c', label: { en: 'Power & Energy', ar: 'الطاقة والكهرباء' } },
];

export const projects = projectRecords.map((project) => ({
  ...project,
  translations: {
    ar: projectTranslations[project.id],
  },
}));
