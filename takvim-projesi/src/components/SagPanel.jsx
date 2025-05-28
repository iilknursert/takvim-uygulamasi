import React, { useState, useEffect, useRef } from "react";

import Sohbetler from "./Sohbetler"; 
import YeniSohbetEkrani from "./YeniSohbetEkrani";

// Ionicons - Kapatma, silme, düzenleme ikonları
import {
  IoMdClose,
  IoMdTrash,
  IoMdCreate
} from "react-icons/io";


// Font Awesome - Sağ panel ikonları (Not, Kişi, Sohbet, Yapılacaklar vs.)
import {
  FaSearch ,
  FaRegStickyNote,
  FaUserFriends,
  FaCommentDots,
 FaListUl,
  FaPlus
} from "react-icons/fa";
import { FiFilter } from "react-icons/fi";

// Axios - API çağrıları
import axios from "axios";


// Stil dosyası
import "../SagPanel.css";


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

const SagPanel = ({ googleUser, aktifBolum, setAktifBolum, gorevler, gorevEkle }) => {



  
  const [notEkleAcik, setNotEkleAcik] = useState(false);
  const [yeniBaslik, setYeniBaslik] = useState("");
  const [yeniIcerik, setYeniIcerik] = useState("");
  const [duzenlenenId, setDuzenlenenId] = useState(null);
  const [kisiler, setKisiler] = useState([]);
  const [aramaTerimi, setAramaTerimi] = useState("");
  const [aramaAcik, setAramaAcik] = useState(false);
  const [yeniGorev, setYeniGorev] = useState("");

  const [filtrelenmisKisiler, setFiltrelenmisKisiler] = useState([]);
  const [sadeceFavoriler, setSadeceFavoriler] = useState(false);
  const [sadeceEmailOlanlar, setSadeceEmailOlanlar] = useState(false);
  const [filtreMenuAcik, setFiltreMenuAcik] = useState(false);
  const [seciliKisi, setSeciliKisi] = useState(null);
  const [yeniSohbetAcik, setYeniSohbetAcik] = useState(false);
  const [yeniGorevAcik, setYeniGorevAcik] = useState(false);
  const [yeniGorevMetin, setYeniGorevMetin] = useState("");
  
  const panelRef = useRef();

  useEffect(() => {
    const favoriler = JSON.parse(localStorage.getItem("favoriKisiler")) || [];
    setKisiler((kisiler) =>
      kisiler.map((k) => ({ ...k, favori: favoriler.includes(k.email) }))
    );
  }, []);

  useEffect(() => {
    if (googleUser?.access_token && kisiler.length === 0) {
      const fetchKisiler = async () => {
        try {
          const res = await axios.get("https://people.googleapis.com/v1/people/me/connections", {
            headers: {
              Authorization: `Bearer ${googleUser.access_token}`,
            },
            params: { personFields: "names,emailAddresses,photos" },
          });
  
          const favoriler = JSON.parse(localStorage.getItem("favoriKisiler")) || [];
          const kisiListesi = res.data.connections || [];
          const veriler = kisiListesi.map(k => {
            const ad = k.names?.[0]?.displayName;
            const foto = k.photos?.[0]?.url;
            const email = k.emailAddresses?.[0]?.value || null;
            return ad ? { ad, foto, email, favori: favoriler.includes(ad) } : null;
          }).filter(Boolean);
  
          setKisiler(veriler);
        } catch (err) {
          console.error("Kişiler alınamadı:", err);
        }
      };
  
      fetchKisiler();
    }
  }, [googleUser]); // aktifBolum kaldırıldı
  

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        !e.target.closest(".sag-panel-iconlar")
      ) {
        setAktifBolum(null);
        setDuzenlenenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notEkle = () => {
    if (yeniBaslik.trim() === "" && yeniIcerik.trim() === "") return;
    if (duzenlenenId !== null) {
      setNotlar((prev) =>
        prev.map((n) =>
          n.id === duzenlenenId
            ? { ...n, baslik: yeniBaslik, icerik: yeniIcerik }
            : n
        )
      );
      setDuzenlenenId(null);
    } else {
      setNotlar([
        ...notlar,
        { id: Date.now(), baslik: yeniBaslik, icerik: yeniIcerik },
      ]);
    }
    setYeniBaslik("");
    setYeniIcerik("");
  };

  const notSil = (id) => {
    setNotlar(notlar.filter((n) => n.id !== id));
  };

  const notDuzenle = (not) => {
    setDuzenlenenId(not.id);
    setYeniBaslik(not.baslik);
    setYeniIcerik(not.icerik);
  };

  const toggleFavori = (ad) => {
    setKisiler((prev) => {
      const yeniListe = prev.map((k) =>
        k.ad === ad ? { ...k, favori: !k.favori } : k
      );
      const favoriler = yeniListe
        .filter((k) => k.favori)
        .map((k) => k.ad); // artık ad üzerinden kaydediyoruz
      localStorage.setItem("favoriKisiler", JSON.stringify(favoriler));
      return yeniListe;
    });
  };
  
  

  useEffect(() => {
    const timeout = setTimeout(() => {
      const filtre = kisiler.filter(k =>
        k.ad.toLowerCase().includes(aramaTerimi.toLowerCase()) ||
        k.email?.toLowerCase().includes(aramaTerimi.toLowerCase())
      );
      setFiltrelenmisKisiler(filtre);
    }, 300);
    return () => clearTimeout(timeout);
  }, [aramaTerimi, kisiler]);

   // Notları localStorage'dan yükle (1 defa)
  const [notlar, setNotlar] = useState(() => {
    const kayitli = localStorage.getItem("notlar");
    return kayitli ? JSON.parse(kayitli) : [];
  });
  

// Notlar değiştikçe kaydet
useEffect(() => {
  localStorage.setItem("notlar", JSON.stringify(notlar));
}, [notlar]);

  const renderNotlar = () => (
    <div className="notlar-panel">
      {/* not ekleme kutusu */}
      {!notEkleAcik ? (
        <div className="not-ekle-alani" onClick={() => setNotEkleAcik(true)}>
          <div className="not-ilk-hali">
            <span className="arti">+</span>
            <span className="not-alin">Not alın...</span>
          </div>
        </div>
      ) : (
        <div className="not-ekle-alani">
          <div className="not-kutu">
            <input className="not-baslik" placeholder="Başlık" value={yeniBaslik} onChange={(e) => setYeniBaslik(e.target.value)} />
            <textarea className="not-icerik" placeholder="Not alın..." value={yeniIcerik} onChange={(e) => setYeniIcerik(e.target.value)} />
            <div className="not-kutu-bottom">
              <span className="not-tamamla-btn" onClick={notEkle}>
                {duzenlenenId !== null ? "Güncelle" : "Tamamlandı"}
              </span>
              <span className="not-tamamla-btn" onClick={() => {
                setDuzenlenenId(null);
                setNotEkleAcik(false);
                setYeniBaslik("");
                setYeniIcerik("");
              }} style={{ marginLeft: 10, color: "gray" }}>İptal</span>
            </div>
          </div>
        </div>
      )}
      {/* not kartları */}
      {notlar.map((not) => (
        <div className="not-kart" key={not.id}>
          <div className="not-kart-header">
            <span className="not-kart-baslik">{not.baslik || "Başlık"}</span>
            <div className="not-kart-ikonlar">
              <span className="ikon" onClick={() => notDuzenle(not)}><IoMdCreate /></span>
              <span className="ikon" onClick={() => notSil(not.id)}><IoMdTrash /></span>
            </div>
          </div>
          <div className="not-kart-icerik">{not.icerik}</div>
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".filtre-wrapper")) {
        setFiltreMenuAcik(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderKisiler = () => {
    {filtreMenuAcik && (
      <div className="filtre-wrapper filtre-menu">
        <label>
          <input
            type="checkbox"
            checked={sadeceFavoriler}
            onChange={(e) => setSadeceFavoriler(e.target.checked)}
          />
          Sadece favoriler
        </label>
        <label>
          <input
            type="checkbox"
            checked={sadeceEmailOlanlar}
            onChange={(e) => setSadeceEmailOlanlar(e.target.checked)}
          />
          Sadece e-posta olanlar
        </label>
      </div>
    )}
    
    if (seciliKisi) {
      const harf = seciliKisi.ad.charAt(0).toUpperCase();
      return (
        <div className="kisi-detay-panel">
          <button onClick={() => setSeciliKisi(null)} className="geri-btn">←</button>
  
          <div className="kisi-profil">
            {seciliKisi.foto ? (
              <img src={seciliKisi.foto} className="kisi-avatar-buyuk" />
            ) : (
              <div className="kisi-avatar-buyuk" style={{ backgroundColor: getRenk(harf) }}>
                {harf}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
              <h2 style={{ margin: 0 }}>{seciliKisi.ad}</h2>
              <span
                className="favori-yildiz"
                style={{ color: seciliKisi.favori ? "gold" : "#ccc", cursor: "pointer", fontSize: 24 }}
                title={seciliKisi.favori ? "Favorilerden çıkar" : "Favorilere ekle"}
                onClick={() => toggleFavori(seciliKisi.ad)}
              >
                {seciliKisi.favori ? "★" : "☆"}
              </span>
            </div>
          </div>
  
          <div className="kisi-detay-bolum">
            <h4>Kişi Bilgileri</h4>
            {seciliKisi.email ? (
              <p>📧 {seciliKisi.email}</p>
            ) : (
              <p style={{ opacity: 0.5 }}>📧 E-posta yok</p>
            )}
            {seciliKisi.telefon ? (
              <p>📞 {seciliKisi.telefon}</p>
            ) : (
              <p style={{ opacity: 0.5 }}>📞 Telefon yok</p>
            )}
          </div>
  
          <div className="kisi-detay-bolum">
            <h4>Hakkında</h4>
            {seciliKisi.dogumTarihi ? (
              <p>🎂 {seciliKisi.dogumTarihi}</p>
            ) : (
              <p style={{ opacity: 0.5 }}>🎂 Doğum tarihi eklenmemiş</p>
            )}
          </div>
        </div>
      );
    }
  
    // Kişi listesi görünümü
    const sirali = [...filtrelenmisKisiler]
      .filter((k) => {
        if (sadeceFavoriler && !k.favori) return false;
        if (sadeceEmailOlanlar && !k.email) return false;
        return true;
      })
      .sort((a, b) => a.ad.localeCompare(b.ad));
  
    return (
      <div className="kisiler-panel">
        <ul className="sag-panel-liste">
          {sirali.map((kisi, i) => {
            const harf = kisi.ad.charAt(0).toUpperCase();
            return (
              <li key={i}>
                <div className="kisi-kart" onClick={() => setSeciliKisi(kisi)}>
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
                  <span
                    className="favori-yildiz"
                    style={{ color: kisi.favori ? "gold" : "#999", cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavori(kisi.ad);
                    }}
                    title={kisi.favori ? "Favorilerden çıkar" : "Favorilere ekle"}
                  >
                    {kisi.favori ? "★" : "☆"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };
  

  const renderIcerik = () => {
    switch (aktifBolum) {
      case "notlar": return renderNotlar();
      case "kisiler": return renderKisiler();
      case "sohbetler":
  return (
    <Sohbetler
      kisiler={kisiler}
      aramaTerimi={aramaTerimi}
      yeniSohbetAcik={yeniSohbetAcik}
      setYeniSohbetAcik={setYeniSohbetAcik}
    />
  );

  case "yapilacaklar":

  const handleYeniGorevEkle = () => {
    if (yeniGorevMetin.trim()) {
      gorevEkle(yeniGorevMetin.trim());
      setYeniGorevMetin("");
      setYeniGorevAcik(false);
    }
  };

  return (
    <div className="yapilacaklar-panel">
      {!yeniGorevAcik ? (
        <div className="not-ekle-alani" onClick={() => setYeniGorevAcik(true)}>
          <div className="not-ilk-hali">
            <span className="arti">+</span>
            <span className="not-alin">Yeni görev ekle...</span>
          </div>
        </div>
      ) : (
        <div className="not-ekle-alani">
          <div className="not-kutu">
            <input
              className="not-baslik"
              placeholder="Görev başlığı"
              value={yeniGorevMetin}
              onChange={(e) => setYeniGorevMetin(e.target.value)}
            />
            <div className="not-kutu-bottom">
              <span className="not-tamamla-btn" onClick={handleYeniGorevEkle}>
                Tamamlandı
              </span>
              <span
                className="not-tamamla-btn"
                onClick={() => {
                  setYeniGorevMetin("");
                  setYeniGorevAcik(false);
                }}
                style={{ marginLeft: 10, color: "gray" }}
              >
                İptal
              </span>
            </div>
          </div>
        </div>
      )}

      <ul className="sag-panel-liste">
        {gorevler && gorevler.length > 0 ? (
          gorevler.map((gorev, i) => (
            <li key={i}>
              <input type="checkbox" id={`todo-${i}`} />
              <label htmlFor={`todo-${i}`}>
                {gorev.title} <br />
                <small>
                  {new Date(gorev.start).toLocaleString("tr-TR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </label>
            </li>
          ))
        ) : (
          <li>Henüz görev eklenmedi.</li>
        )}
      </ul>
    </div>
  );

      default: return null;
    }
  };

  return (
    <div className="sag-panel-wrapper">
      <div className="sag-panel-iconlar">
        <button onClick={() => setAktifBolum("notlar")}><FaRegStickyNote /></button>
        <button onClick={() => setAktifBolum("kisiler")}><FaUserFriends /></button>
        <button onClick={() => setAktifBolum("sohbetler")}><FaCommentDots /></button>
        <button onClick={() => setAktifBolum("yapilacaklar")}><FaListUl /></button>
      </div>
      {aktifBolum && (
        <div className="sag-panel-icerik acik" ref={panelRef}>
          <div className="sag-panel-header">
          <div className="sag-panel-header-sol">
  {aktifBolum === "sohbetler" && yeniSohbetAcik && (
    <button
      onClick={() => setYeniSohbetAcik(false)}
      className="ikon-btn"
      title="Geri dön"
      style={{ marginRight: "8px" }}
    >
      ←
    </button>
  )}
  <span className="sag-panel-baslik-yazi">
    {aktifBolum.charAt(0).toUpperCase() + aktifBolum.slice(1)}
  </span>
</div>


  <div className="sag-panel-header-sag">
  <button
    title="Ara"
    className="ikon-btn"
    onClick={() => setAramaAcik(!aramaAcik)}
  >
    <FaSearch />
  </button>

  {aktifBolum === "sohbetler" && (
    <button
      title="Yeni Sohbet"
      className="ikon-btn"
      onClick={() => setYeniSohbetAcik(true)}
    >
      <FaPlus />
    </button>
  )}

  <button
    title="Kapat"
    className="ikon-btn"
    onClick={() => setAktifBolum(null)}
  >
    <IoMdClose />
  </button>
</div>
</div>


          <hr className="sag-panel-cizgi" />
          <div className="sag-panel-icerik-scroll">{renderIcerik()}</div>
        </div>
      )}
    </div>
  );
};

export default SagPanel;
