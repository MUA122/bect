import React from "react";
import { Box } from "@mui/material";
import "./PartnerLogoCarousel.css";

const wikiLogo = (fileName) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;

const partners = [
  { name: "World Bank Group", logo: wikiLogo("World Bank Group logo.svg"), color: "#00558c", wide: true },
  { name: "European Investment Bank", logo: wikiLogo("European Investment Bank logo.svg"), color: "#004494", wide: true },
  { name: "European Bank for Reconstruction and Development", logo: wikiLogo("EBRD logo.png"), color: "#006341", wide: true },
  { name: "Asian Development Bank", logo: wikiLogo("ADB logo & wordmark.svg"), color: "#1f75bb", wide: true },
  { name: "United Nations", logo: "https://cdn.simpleicons.org/unitednations/009EDB", color: "#009edb" },
  { name: "EDF", logo: wikiLogo("\u00c9lectricit\u00e9 de France logo.svg"), color: "#f58025" },
  { name: "SYSTRA", logo: wikiLogo("SYSTRA - logo.jpeg"), color: "#d71920", wide: true },
  { name: "Siemens", logo: "https://cdn.simpleicons.org/siemens/009999", color: "#009999" },
  { name: "Schneider Electric", logo: wikiLogo("SchneiderElectric Logo.svg"), color: "#3dcd58", wide: true },
  { name: "Alstom", logo: wikiLogo("Alstom logo.svg"), color: "#0a2e6d", wide: true },
  { name: "AREP", logo: wikiLogo("Arep logo.jpg"), color: "#111111" },
  { name: "ARUP", logo: wikiLogo("Arup logo.svg"), color: "#d71920", wide: true },
  { name: "Perkins & Will", logo: wikiLogo("PW-logo-black.svg"), color: "#111111", wide: true },
  { name: "Veolia", logo: wikiLogo("Veolia logo.svg"), color: "#e30613", wide: true },
  { name: "Vinci Construction", logo: wikiLogo("Vinci (Unternehmen) logo.svg"), color: "#004489", wide: true },
  { name: "Saudi Arabia Airlines", logo: "https://cdn.simpleicons.org/saudia/006C35", color: "#006c35" },
  { name: "General Electric", logo: "https://cdn.simpleicons.org/generalelectric/0870B8", color: "#0870b8" },
  { name: "GIZ", logo: wikiLogo("Deutsche Gesellschaft f\u00fcr Internationale Zusammenarbeit Logo.svg"), color: "#e30613", wide: true },
  { name: "CIB", logo: wikiLogo("Cib Logo.svg"), color: "#f5a800", wide: true },
  { name: "Sabbour", logo: "https://sabbour.com/wp-content/uploads/2023/04/Frame-svg.svg", color: "#2d5578" },
  { name: "Talaat Mostafa Group", logo: "https://talaatmoustafa.com/wp-content/uploads/2023/10/Group-738-1.webp", color: "#a67c2d", wide: true },
  { name: "Cleopatra Group", logo: "https://www.groupcleopatra.com/wp-content/themes/cleopatra_group/img/group_logo_bigger.png", color: "#8a6f3d", wide: true },
  { name: "Nestle", logo: wikiLogo("Nestle textlogo blue.svg"), color: "#63513d", wide: true },
  { name: "Utopia Pharmaceuticals", logo: "https://www.utopiapharma.com/sites/default/files/Utopia%20logo-01.png", color: "#009fda", wide: true },
];

function LogoStrip() {
  return (
    <Box className="partner-logo-track" aria-hidden="true">
      {partners.map((partner) => (
        <Box
          className={`partner-logo-card ${partner.wide ? "is-wide" : ""}`}
          key={partner.name}
          sx={{ "--brand-color": partner.color }}
        >
          <img src={partner.logo} alt={partner.name} loading="lazy" />
        </Box>
      ))}
    </Box>
  );
}

function PartnerLogoCarousel({ language = "en" }) {
  const isArabic = language === "ar";

  return (
    <Box
      component="section"
      className="partner-logos-section"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Box
        className={`partner-logo-marquee ${isArabic ? "is-rtl" : ""}`}
        aria-label="Partner and client logo carousel"
        dir="ltr"
      >
        <LogoStrip />
        <LogoStrip />
      </Box>
    </Box>
  );
}

export default PartnerLogoCarousel;
