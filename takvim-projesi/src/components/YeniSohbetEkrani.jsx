// src/components/YeniSohbetEkrani.jsx
import React from "react";
import "../Sohbet.css";
import SagPanel from "./SagPanel.jsx";

const YeniSohbetEkrani = ({ kisiler = [], onKisiSec, geriDon, aramaTerimi }) => {
  const getRenk = (harf) => {
    const renkler = {
      A: "#f44336", B: "#e91e63", C: "#9c27b0", D: "#673ab7", E: "#3f51b5",
      F: "#2196f3", G: "#03a9f4", H: "#00bcd4", I: "#009688", J: "#4caf50",
      K: "#8bc34a", L: "#cddc39", M: "#ffeb3b", N: "#ffc107", O: "#ff9800",
      P: "#ff5722", Q: "#795548", R: "#9e9e9e", S: "#607d8b", T: "#ff6f61",
      U: "#6a1b9a", V: "#43a047", W: "#1e88e5", X: "#f06292", Y: "#ba68c8",
      Z: "#a1887f"
    };
    return renkler[harf.toUpperCase()] || "#999";
  };

  
  const filtreli = kisiler.filter((k) =>
    typeof k.ad === "string" &&
    typeof aramaTerimi === "string" &&
    k.ad.toLowerCase().includes(aramaTerimi.toLowerCase())
  );
  
  
  
  return (
    <div className="kisiler-panel" style={{ maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
      <ul className="sag-panel-liste">
        {filtreli.length > 0 ? (
          filtreli.map((kisi, i) => {
            const harf = kisi.ad.charAt(0).toUpperCase();
            return (
              <li key={kisi.email || i}>
                <div className="kisi-kart" onClick={() => onKisiSec(kisi)}>
                  {kisi.foto ? (
                    <img src={kisi.foto} alt={kisi.ad} className="kisi-avatar" />
                  ) : (
                    <div className="kisi-avatar" style={{ backgroundColor: getRenk(harf) }}>
                      {harf}
                    </div>
                  )}
                  <div className="kisi-bilgiler">
                    <div className="kisi-isim" title={kisi.ad}>{kisi.ad}</div>
                    {kisi.email && (
                      <div className="kisi-email" title={kisi.email}>{kisi.email}</div>
                    )}
                  </div>
                </div>
              </li>
            );
          })
        ) : (
          <div className="bos-sonuc">Kişi bulunamadı</div>
        )}
      </ul>
    </div>
  );
};

export default YeniSohbetEkrani;
