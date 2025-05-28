import React, { useState, useRef, useEffect } from "react";
import "../Sohbet.css";
import { connectWebSocket, sendMessage } from "../websocket";

const KisiSohbetEkrani = ({ kisi, geriDon }) => {
  const [mesajlar, setMesajlar] = useState(() => {
    const tumSohbetler = JSON.parse(localStorage.getItem("sohbetler")) || [];
    const buKisiSohbeti = tumSohbetler.find((s) => s.kullanici === kisi.ad);
    return buKisiSohbeti?.mesajlar || [];
  });


  const [yeniMesaj, setYeniMesaj] = useState("");
  const mesajlarRef = useRef(null);

  useEffect(() => {
    connectWebSocket((gelenMesaj) => {
      setMesajlar((prev) => [...prev, gelenMesaj]);
    });
  }, []);

  useEffect(() => {
    mesajlarRef.current?.scrollTo({
      top: mesajlarRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [mesajlar]);

  const mesajGonder = () => {
    if (!yeniMesaj.trim()) return;
    const zaman = new Date().toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const yeni = {
      gonderen: "ben",
      icerik: yeniMesaj,
      zaman,
      durum: "✓",
    };
    const guncellenmis = [...mesajlar, yeni];
    setMesajlar(guncellenmis);
    setYeniMesaj("");

    const tumSohbetler = JSON.parse(localStorage.getItem("sohbetler")) || [];
    const digerSohbetler = tumSohbetler.filter((s) => s.kullanici !== kisi.ad);
    const yeniSohbet = {
      kullanici: kisi.ad,
      mesajlar: guncellenmis,
      mesaj: yeni.icerik,
      zaman: yeni.zaman,
    };
    localStorage.setItem("sohbetler", JSON.stringify([...digerSohbetler, yeniSohbet]));
  };

  return (
    <div className="kisi-sohbet-container">
      <div className="sohbet-header">
        <button className="geri-btn" onClick={geriDon}>←</button>
        {kisi.foto ? (
          <img src={kisi.foto} alt={kisi.ad} className="kisi-header-avatar" />
        ) : (
          <div className="kisi-header-avatar" style={{ backgroundColor: "#bbb" }}>
            {kisi.ad.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="sohbet-kisi-adi">{kisi.ad}</span>
      </div>

      <div className="mesajlar-alani" ref={mesajlarRef}>
        {mesajlar.map((m, i) => (
          <div
            key={i}
            className={`mesaj-balon ${m.gonderen === "ben" ? "benim" : "diger"}`}
          >
            <div>{m.icerik}</div>
            <div className="mesaj-zaman">
            {m.zaman} {m.gonderen === "ben" && m.durum}
            </div>
          </div>
        ))}
      </div>

      <div className="mesaj-giris">
        <input
          type="text"
          placeholder="Mesaj yaz..."
          value={yeniMesaj}
          onChange={(e) => setYeniMesaj(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && mesajGonder()}
        />
        <button onClick={mesajGonder}>Gönder</button>
      </div>
    </div>
  );
};

export default KisiSohbetEkrani;
