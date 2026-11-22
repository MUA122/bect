import React from "react";

export default function ArabicWordmark({ white = false, alt = "بيكت للاستشارات الهندسية", ...props }) {
  return <img {...props} src={`/company-profile/ar/wordmark-${white ? "white" : "header"}.png`}
    alt={alt} width="3221" height={white ? 805 : 804} />;
}
