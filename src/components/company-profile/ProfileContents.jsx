import React, { useEffect, useRef, useState } from "react";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import { formatPage, sectionLabel } from "./profileCopy";

function searchable(value) {
  return value.toLowerCase().trim().replace(/[٠-٩]/g, (n) => String("٠١٢٣٤٥٦٧٨٩".indexOf(n)));
}

export default function ProfileContents({ slides, current, text, language, onClose, onSelect }) {
  const dialog = useRef(null);
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("");
  const sectors = [...new Set(slides.map((slide) => slide.sector).filter(Boolean))];
  const search = searchable(query);
  const results = slides.filter((slide) => (!sector || slide.sector === sector) &&
    (!search || searchable(slide.title).includes(search) || String(slide.number) === String(Number(search))));

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  return <dialog ref={dialog} className="cp-contents" aria-labelledby="cp-contents-title"
    onCancel={(e) => { e.preventDefault(); onClose(); }}
    onClick={(e) => { if (e.target === dialog.current) onClose(); }}>
    <div className="cp-contents-body">
      <header><h2 id="cp-contents-title">{text.contents}</h2>
        <button className="cp-icon" type="button" aria-label={text.close} title={text.close} onClick={onClose} autoFocus><CloseOutlined /></button></header>
      <div className="cp-search-row">
        <label className="cp-search"><SearchOutlined aria-hidden="true" /><input type="search" value={query}
          aria-label={text.search} placeholder={text.search} onChange={(e) => setQuery(e.target.value)} /></label>
        <select aria-label={text.sectors} value={sector} onChange={(e) => setSector(e.target.value)}>
          <option value="">{text.all}</option>
          {sectors.map((name) => <option value={name} key={name}>{sectionLabel(name, language)}</option>)}
        </select>
      </div>
      <div className="cp-contents-grid">
        {results.map((slide) => <button type="button" key={slide.number}
          aria-current={slide.number === current ? "page" : undefined} onClick={() => onSelect(slide.number)}>
          <span className="cp-thumb-holder"><img src={slide.thumbnail} alt="" loading="lazy" decoding="async" /></span>
          <span className="cp-thumb-caption"><small>{formatPage(slide.number, language)}</small><span lang={language} dir="auto">{slide.title}</span></span>
        </button>)}
        {results.length === 0 && <p>{text.empty}</p>}
      </div>
    </div>
  </dialog>;
}
