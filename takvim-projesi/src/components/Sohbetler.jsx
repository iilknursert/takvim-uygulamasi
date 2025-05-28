import React, { useState } from "react";
import SohbetListesi from "./SohbetListesi";
import YeniSohbetEkrani from "./YeniSohbetEkrani";
import KisiSohbetEkrani from "./KisiSohbetEkrani";

const Sohbetler = ({ kisiler, aramaTerimi, yeniSohbetAcik, setYeniSohbetAcik }) => {
  const [secilenKisi, setSecilenKisi] = useState(null);
  const [sohbetler, setSohbetler] = useState(() => {
    const kayitli = localStorage.getItem("sohbetler");
    return kayitli ? JSON.parse(kayitli) : [];
  });

  const kisiSecildi = (kisi) => {
    setSecilenKisi(kisi);
    setYeniSohbetAcik(false);
  };

  const geriDon = () => {
    setSecilenKisi(null);
    setYeniSohbetAcik(false);
  };

  return (
    <div className="sohbetler-container">
      {secilenKisi ? (
        <KisiSohbetEkrani
          kisi={secilenKisi}
          geriDon={geriDon}
          sohbetler={sohbetler}
          setSohbetler={setSohbetler}
        />
      ) : yeniSohbetAcik ? (
        <YeniSohbetEkrani
          kisiler={kisiler}
          onKisiSec={kisiSecildi}
          aramaTerimi={aramaTerimi}
          geriDon={geriDon}
        />
      ) : (
        <SohbetListesi sohbetler={sohbetler} onKisiSec={kisiSecildi} />
      )}
    </div>
  );
};

export default Sohbetler;
