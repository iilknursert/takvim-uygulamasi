import React, { useState, useRef, useEffect } from "react";
import { Menu, Search, HelpCircle, Settings, LogOut } from "lucide-react";
import "../UstMenu.css";

const UstMenu = ({ 
  toggleYanPanel, 
  tema, 
  setTema, 
  temaRenk, 
  setTemaRenk, 
  kullaniciAdi, 
  cikisYap 
}) => {
  const [aramaAcik, setAramaAcik] = useState(false);
  const [ayarlarAcik, setAyarlarAcik] = useState(false);
  const [gorunumPanelAcik, setGorunumPanelAcik] = useState(false);
  const aramaRef = useRef();
  const ayarRef = useRef();

  const pastelRenk = temaRenk;

  const hexToLighterHex = (hex, lightenFactor = 0.85) => {
    let [r, g, b] = hex.match(/\w\w/g).map((c) => parseInt(c, 16));
    r = Math.min(255, Math.floor(r + (255 - r) * lightenFactor));
    g = Math.min(255, Math.floor(g + (255 - g) * lightenFactor));
    b = Math.min(255, Math.floor(b + (255 - b) * lightenFactor));
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
  };

  const applyThemeColors = () => {
    document.body.dataset.tema = tema;
    const root = document.documentElement;
    if (tema === "acik") {
      root.style.setProperty("--tema-rengi", pastelRenk);
      root.style.setProperty("--tema-rengi-acik", hexToLighterHex(pastelRenk));
    } else {
      root.style.setProperty("--tema-rengi", "#1e1e1e");
      root.style.setProperty("--tema-rengi-acik", "#2c2c2c");
    }
  };

  useEffect(() => {
    applyThemeColors();
  }, [tema, pastelRenk]);

  useEffect(() => {
    const handleClickDisi = (e) => {
      if (aramaRef.current && !aramaRef.current.contains(e.target)) {
        setAramaAcik(false);
      }
      if (ayarRef.current && !ayarRef.current.contains(e.target)) {
        setAyarlarAcik(false);
        setGorunumPanelAcik(false);
      }
    };
    document.addEventListener("mousedown", handleClickDisi);
    return () => document.removeEventListener("mousedown", handleClickDisi);
  }, []);

  return (
    <div className="ust-menu-container">
      <div className="ust-menu" style={{ backgroundColor: tema === "acik" ? pastelRenk : undefined }}>
        <div className="ust-sol">
          <button onClick={toggleYanPanel} className="menu-btn">
            <Menu size={22} />
          </button>
        </div>

        <div className="ust-sag">
          

          <div ref={aramaRef} className="arama-alani">
            <button onClick={() => setAramaAcik(!aramaAcik)}>
              <Search size={20} />
            </button>
            <input
              type="text"
              placeholder="Ara"
              className={`arama-input ${aramaAcik ? "acik" : ""}`}
            />
          </div>

          <button><HelpCircle size={20} /></button>

          <div className="ayar-menu-container" ref={ayarRef}>
            <button onClick={() => setAyarlarAcik(!ayarlarAcik)}>
              <Settings size={20} />
            </button>

            {ayarlarAcik && (
              <div className="ayar-dropdown">
                <button className="ayar-secim" onClick={() => setGorunumPanelAcik(!gorunumPanelAcik)}>
                  Görünüm
                </button>
              </div>
            )}

            {gorunumPanelAcik && (
              <div className="gorunum-panel">
                <h3 className="panel-baslik">Görünüm</h3>

                <div className="tema-secimleri">
                  {["acik", "koyu"].map((secenek) => (
                    <div
                      key={secenek}
                      className={`tema-kart ${tema === secenek ? "aktif" : ""}`}
                      onClick={() => setTema(secenek)}
                    >
                      <div className={`tema-gorsel ${secenek}`}></div>
                      <span>{secenek === "acik" ? "Açık" : "Koyu"}</span>
                    </div>
                  ))}
                </div>

                {tema === "acik" && (
                  <div className="pastel-renkler">
                    <h4>Renk ayarı</h4>
                    <div className="renk-secim">
                      {["#eb7fd9", "#a5c8ff", "#a8e6cf", "#c3b1e1", "#fff7a9"].map((renk) => (
                        <div
                          key={renk}
                          className={`renk-kutu ${pastelRenk === renk ? "aktif" : ""}`}
                          style={{ backgroundColor: renk }}
                          onClick={() => setTemaRenk(renk)}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 🔴 Çıkış Yap Butonu */}
          <button onClick={cikisYap} className="btn-cikis" title="Çıkış Yap">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UstMenu;
