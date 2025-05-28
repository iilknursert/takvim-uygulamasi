import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import "../YanPanel.css";

function toLocalISOString(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes())
  );
}

const YanPanel = ({
  kullaniciAdi = "KULLANICI ADI",
  setModalAcik,
  setModalPosition,
  setModalCoords,
  setEtkinlikTarihi,
  setBitisTarihi,
  gorunurTakvimler,
  setGorunurTakvimler,
  digerTakvimler,
  setDigerTakvimler,
  setAktifBolum,
}) => {
  const [tarih, setTarih] = useState(new Date());
  const [sonTiklananTarih, setSonTiklananTarih] = useState(null);
  const [tiklanmaSayisi, setTiklanmaSayisi] = useState(0);

  const takvimToggle = (isim) => {
    setGorunurTakvimler((prev) => ({
      ...prev,
      [isim]: !prev[isim],
    }));
  };

  const yeniTakvimEkle = () => {
    const isim = prompt("Yeni takvimin adı:");
    if (!isim) return;

    const zatenVar =
      digerTakvimler.includes(isim) ||
      ["Etkinlik", "Görev", "Doğum günü", kullaniciAdi].includes(isim);

    if (zatenVar) {
      alert("Bu isimde bir takvim zaten var.");
      return;
    }

    setDigerTakvimler((prev) => [...prev, isim]);
    setGorunurTakvimler((prev) => ({ ...prev, [isim]: true }));
  };

  const handleOlusturTikla = () => {
    const simdi = new Date();
    const bitis = new Date(simdi);
    bitis.setHours(simdi.getHours() + 1);

    setEtkinlikTarihi?.(toLocalISOString(simdi));
    setBitisTarihi?.(toLocalISOString(bitis));
    setModalCoords?.({ top: window.innerHeight / 2, left: window.innerWidth / 2 });
    setModalPosition?.("center");
    setModalAcik?.(true);
  };

  const handleTarihSecimi = (seciliTarih) => {
    const ayniGunMu =
      sonTiklananTarih &&
      seciliTarih.toDateString() === sonTiklananTarih.toDateString();

    setTarih(seciliTarih);
    setSonTiklananTarih(seciliTarih);

    if (ayniGunMu) {
      setTiklanmaSayisi((prev) => prev + 1);
      if (tiklanmaSayisi + 1 === 2) {
        localStorage.setItem("gorunum", "gunluk");
        localStorage.setItem("gunlukTarih", seciliTarih.toISOString());
        window.location.reload();
      }
    } else {
      setTiklanmaSayisi(1);
    }
  };

  const varsayilanTakvimler = [kullaniciAdi, "Etkinlik", "Doğum günü", "Görev"];

  return (
    <div className="sidebar">
      <button className="olustur-btn" onClick={handleOlusturTikla}>
        <span className="plus-icon">+</span> Oluştur
      </button>

      <div className="takvim-kutusu">
        <Calendar
          onChange={handleTarihSecimi}
          value={tarih}
          locale="tr-TR"
          className="custom-calendar"
          firstDayOfWeek={1}
          formatShortWeekday={(locale, date) =>
            ["P", "P", "S", "Ç", "P", "C", "C"][date.getDay()]
          }
          tileClassName={({ date }) => {
            const bugun = new Date();
            return date.toDateString() === bugun.toDateString()
              ? "takvimde-bugun"
              : null;
          }}
        />
      </div>

      <button className="kisi-arama" onClick={() => setAktifBolum("kisiler")}>
        <span className="icon">👤</span> Kişi arayın
      </button>

      <div className="takvim-listesi">
        <p className="takvim-baslik">Takvimlerim</p>
        <ul className="takvim-item-list">
          {varsayilanTakvimler.map((ad) => (
            <li key={ad} className="takvim-item">
              <input
                type="checkbox"
                checked={!!gorunurTakvimler[ad]}
                onChange={() => takvimToggle(ad)}
              />
              <span>{ad}</span>
            </li>
          ))}
        </ul>

        <p className="takvim-baslik">
          Diğer takvimler <span className="ekle-icon" onClick={yeniTakvimEkle}>+</span>
        </p>
        <ul className="takvim-item-list">
          {digerTakvimler.map((ad) => (
            <li key={ad} className="takvim-item">
              <input
                type="checkbox"
                checked={!!gorunurTakvimler[ad]} 
                onChange={() => takvimToggle(ad)}
              />
              <span>{ad}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default YanPanel;
