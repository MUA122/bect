export const profileCopy = {
  en: {
    title: "Company profile", titleLines: ["Company", "Profile."],
    edition: "2026 edition", publication: "Digital publication", home: "BECT website",
    intro: "The people, projects and disciplines behind 35+ years of engineering consultancy.",
    explore: "Explore company profile", clickToView: "Click to view", tapToView: "Tap to view",
    regionalPresence: "Our regional presence",
    page: "Page",
    backToIntro: "Back to introduction", opening: "Opening the profile", preparingEdition: "Preparing the English edition…", loading: "Preparing page", contents: "Contents",
    search: "Find a page or project", sectors: "Sections", all: "All sections",
    empty: "No matching pages.", previous: "Previous", next: "Next", close: "Close",
    closeProfile: "Close profile", fullscreen: "Fullscreen", exitFullscreen: "Exit fullscreen",
    zoomIn: "Zoom in", zoomOut: "Zoom out", zoomReset: "Fit page", progress: "Reading progress",
    error: "This page could not be loaded.", retry: "Try again", reader: "Company profile reader",
    enlarge: "Enlarge", leftPage: "Left page", rightPage: "Right page",
    touchHint: "Swipe to turn the page · Pinch to zoom", panHint: "Drag to explore the page",
    keyPan: "Use the arrow keys to pan", languages: "العربية",
  },
  ar: {
    title: "الملف التعريفي", titleLines: ["ملف الشركة", "التعريفي"],
    edition: "إصدار ٢٠٢٦", publication: "إصدار رقمي", home: "موقع الشركة",
    intro: "تعرّف على فريقنا ومشروعاتنا وتخصصاتنا عبر أكثر من ٣٥ عامًا من الاستشارات الهندسية.",
    explore: "استكشف ملف الشركة", clickToView: "انقر للعرض", tapToView: "المس للعرض",
    regionalPresence: "حضورنا الإقليمي",
    page: "صفحة",
    backToIntro: "العودة إلى المقدمة", opening: "جارٍ فتح الملف", preparingEdition: "جارٍ تجهيز النسخة العربية…", loading: "جارٍ تجهيز الصفحة", contents: "المحتويات",
    search: "ابحث عن صفحة أو مشروع", sectors: "الأقسام", all: "جميع الأقسام",
    empty: "لا توجد صفحات مطابقة.", previous: "السابق", next: "التالي", close: "إغلاق",
    closeProfile: "إغلاق الملف", fullscreen: "ملء الشاشة", exitFullscreen: "إنهاء ملء الشاشة",
    zoomIn: "تكبير", zoomOut: "تصغير", zoomReset: "ملاءمة الصفحة", progress: "تقدم القراءة",
    error: "تعذّر تحميل هذه الصفحة.", retry: "إعادة المحاولة", reader: "قارئ الملف التعريفي",
    enlarge: "تكبير", leftPage: "الصفحة اليسرى", rightPage: "الصفحة اليمنى",
    touchHint: "اسحب لتصفح الصفحات · باعد بين إصبعيك للتكبير", panHint: "اسحب لاستكشاف الصفحة",
    keyPan: "استخدم مفاتيح الأسهم لتحريك الصفحة", languages: "English",
  },
};

const arabicPageNumber = new Intl.NumberFormat("ar-EG", { minimumIntegerDigits: 3, useGrouping: false });
export const formatPage = (number, language) => language === "ar" ? arabicPageNumber.format(number) : String(number).padStart(3, "0");

const arabicSections = {
  "Company Profile": "الملف التعريفي",
  "Practice Overview": "نبذة عن الشركة",
  "Selected Projects": "مشروعات مختارة",
  "Urban & Landscape": "التصميم العمراني وتنسيق المواقع",
  Commercial: "المشروعات التجارية",
  Educational: "المشروعات التعليمية",
  Industrial: "المشروعات الصناعية",
  "Headquarters and Offices": "المقار الرئيسية والمكاتب",
  Healthcare: "الرعاية الصحية",
  "Water & Wastewater": "المياه والصرف الصحي",
  "Historic Restoration": "ترميم المباني التاريخية",
  "Power & Energy": "الكهرباء والطاقة",
  Transportation: "النقل والمواصلات",
  "List of Projects": "قائمة المشروعات",
};

export function sectionLabel(name, language) {
  return language === "ar" ? (arabicSections[name] ?? name) : name;
}
