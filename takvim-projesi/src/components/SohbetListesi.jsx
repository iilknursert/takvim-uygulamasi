import React from "react";
import "../Sohbet.css";

const SohbetListesi = ({ sohbetler = [], onKisiSec }) => {
  if (sohbetler.length === 0) {
    return <div className="bos-sohbetler">Henüz sohbet yok</div>;
  }

  const sirali = [...sohbetler].sort((a, b) =>
    b.zaman?.localeCompare(a.zaman || "") || 0
  );

  return (
    <div className="sohbet-listesi">
      {sirali.map((sohbet, index) => (
        <div
          key={index}
          className="sohbet-karti"
          onClick={() => onKisiSec({ ad: sohbet.kullanici })}
        >
          <div className="sohbet-isim">{sohbet.kullanici}</div>
          <div className="sohbet-son-mesaj">{sohbet.mesaj}</div>
        </div>
      ))}
    </div>
  );
};

export default SohbetListesi;
