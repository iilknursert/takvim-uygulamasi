// src/components/SohbetEkrani.jsx
import React, { useState } from "react";
import "../Sohbet.css";

const SohbetEkrani = ({ kisi, geriDon }) => {
  const [mesajlar, setMesajlar] = useState([]);
  const [yeniMesaj, setYeniMesaj] = useState("");

  const handleGonder = () => {
    if (!yeniMesaj.trim()) return;
    setMesajlar([...mesajlar, { gonderen: "ben", icerik: yeniMesaj }]);
    setYeniMesaj("");
  };

  return (
    <div className="sohbet-ekrani">
      <div className="sohbet-header">
        <button onClick={geriDon}>←</button>
        <span>{kisi.ad}</span>
      </div>

      <div className="mesajlar-alani">
        {mesajlar.map((msg, index) => (
          <div key={index} className={`mesaj ${msg.gonderen === "ben" ? "ben" : "onlar"}`}>
            {msg.icerik}
          </div>
        ))}
      </div>

      <div className="mesaj-gonder-alani">
        <input
          type="text"
          placeholder="Mesaj yaz..."
          value={yeniMesaj}
          onChange={(e) => setYeniMesaj(e.target.value)}
        />
        <button onClick={handleGonder}>Gönder</button>
      </div>
    </div>
  );
};

export default SohbetEkrani;
