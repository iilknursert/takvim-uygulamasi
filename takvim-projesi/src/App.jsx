import { useState, useEffect } from "react";
import UstMenu from "./components/UstMenu";
import YanPanel from "./components/YanPanel";
import TakvimGorunum from "./components/TakvimGorunum";
import GirisEkrani from "./components/GirisEkrani";
import SagPanel from "./components/SagPanel";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { connectWebSocket, mesajGonder } from "./websocket";
import "./App.css";
import "./index.css";

const AppContent = () => {
  const [yanPanelAcik, setYanPanelAcik] = useState(true);
  const [tema, setTema] = useState(() => localStorage.getItem("tema") || "acik");
  const [temaRenk, setTemaRenk] = useState(() => localStorage.getItem("temaRenk") || "#eb7fd9");
  const [kullaniciAdi, setKullaniciAdi] = useState(() => localStorage.getItem("kullaniciAdi") || "");
  const [girisYapildiMi, setGirisYapildiMi] = useState(() => localStorage.getItem("girisYapildiMi") === "true");
  const [etkinlikler, setEtkinlikler] = useState([]);

  const [googleUser, setGoogleUser] = useState(() => {
    const stored = localStorage.getItem("googleUser");
    return stored ? JSON.parse(stored) : null;
  });

  const [gorunurTakvimler, setGorunurTakvimler] = useState({
    "Etkinlik": true,
    "Görev": true,
    "Doğum günü": true,
  });

  const [digerTakvimler, setDigerTakvimler] = useState(() => {
    const kayitli = localStorage.getItem("digerTakvimler");
    return kayitli ? JSON.parse(kayitli) : [];
  });

  const gorevler = etkinlikler.filter(e => e.takvim === "Görev");

  const gorevEkle = async (baslik) => {
    const simdi = new Date();
    const bitis = new Date(simdi.getTime() + 60 * 60 * 1000);

    const yeniGorev = {
      title: baslik,
      start: simdi.toISOString(),
      endTime: bitis.toISOString(),
      color: "#F7C6C7",
      takvim: "Görev",
      hatirlatildi: false,
    };

    const res = await fetch("http://localhost:9191/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("testuser:1234"),
      },
      body: JSON.stringify(yeniGorev),
    });

    if (res.ok) {
      const kaydedilen = await res.json();
      setEtkinlikler((prev) => [...prev, kaydedilen]);
    }
  };

  const [modalAcik, setModalAcik] = useState(false);
  const [modalCoords, setModalCoords] = useState({ top: 0, left: 0 });
  const [modalPosition, setModalPosition] = useState("center");
  const [etkinlikTarihi, setEtkinlikTarihi] = useState("");
  const [bitisTarihi, setBitisTarihi] = useState("");
  const [aktifBolum, setAktifBolum] = useState(null);

  const [mesajlar, setMesajlar] = useState([]);
  const [icerik, setIcerik] = useState("");

  useEffect(() => {
    localStorage.setItem("digerTakvimler", JSON.stringify(digerTakvimler));
  }, [digerTakvimler]);

  useEffect(() => {
    localStorage.setItem("girisYapildiMi", girisYapildiMi);
    localStorage.setItem("kullaniciAdi", kullaniciAdi);
  }, [girisYapildiMi, kullaniciAdi]);

  useEffect(() => {
    localStorage.setItem("tema", tema);
  }, [tema]);

  useEffect(() => {
    localStorage.setItem("temaRenk", temaRenk);
  }, [temaRenk]);

  useEffect(() => {
    connectWebSocket((gelenMesaj) => {
      setMesajlar(prev => [...prev, gelenMesaj]);
    });
  }, []);

  const handleSend = () => {
    const yeniMesaj = {
      gonderen: kullaniciAdi || "Anonim",
      icerik: icerik,
      zaman: new Date().toISOString(),
      durum: "okundu"
    };
    mesajGonder(yeniMesaj);
    setIcerik('');
  };

  const toggleYanPanel = () => setYanPanelAcik(prev => !prev);

  if (!girisYapildiMi) {
    return (
      <GirisEkrani
        setGirisYapildiMi={setGirisYapildiMi}
        setKullaniciAdi={setKullaniciAdi}
        setGoogleUser={setGoogleUser}
      />
    );
  }

  return (
    <div className="container">
      <UstMenu
        toggleYanPanel={toggleYanPanel}
        tema={tema}
        setTema={setTema}
        temaRenk={temaRenk}
        setTemaRenk={setTemaRenk}
        kullaniciAdi={kullaniciAdi}
        cikisYap={() => {
          localStorage.clear();
          setGirisYapildiMi(false);
          window.location.reload();
        }}
      />

      <div className="flex flex-grow">
        {yanPanelAcik && (
          <YanPanel
            kullaniciAdi={kullaniciAdi}
            setModalAcik={setModalAcik}
            setModalPosition={setModalPosition}
            setModalCoords={setModalCoords}
            setEtkinlikTarihi={setEtkinlikTarihi}
            setBitisTarihi={setBitisTarihi}
            gorunurTakvimler={gorunurTakvimler}
            setGorunurTakvimler={setGorunurTakvimler}
            digerTakvimler={digerTakvimler}
            setDigerTakvimler={setDigerTakvimler}
            setAktifBolum={setAktifBolum}
          />
        )}

        <TakvimGorunum
          kullaniciAdi={kullaniciAdi}
          gorunurTakvimler={gorunurTakvimler}
          yanPanelAcik={yanPanelAcik}
          digerTakvimler={digerTakvimler}
          setDigerTakvimler={setDigerTakvimler}
          modalAcik={modalAcik}
          setModalAcik={setModalAcik}
          modalCoords={modalCoords}
          setModalCoords={setModalCoords}
          modalPosition={modalPosition}
          setModalPosition={setModalPosition}
          etkinlikTarihi={etkinlikTarihi}
          setEtkinlikTarihi={setEtkinlikTarihi}
          bitisTarihi={bitisTarihi}
          setBitisTarihi={setBitisTarihi}
          etkinlikler={etkinlikler}
          setEtkinlikler={setEtkinlikler}


        />

        <SagPanel
          googleUser={googleUser}
          aktifBolum={aktifBolum}
          setAktifBolum={setAktifBolum}
          gorevler={etkinlikler.filter(e => e.takvim === "Görev")}
          gorevEkle={gorevEkle}
        />

      </div>

      <div style={{ padding: "1rem", borderTop: "1px solid #ccc" }}>
        <h3>WebSocket Mesaj Test</h3>
        <ul>
          {mesajlar.map((msg, i) => (
            <li key={i}><strong>{msg.gonderen}:</strong> {msg.icerik}</li>
          ))}
        </ul>

        <input
          type="text"
          value={icerik}
          onChange={(e) => setIcerik(e.target.value)}
          placeholder="Mesaj yaz..."
        />
        <button onClick={handleSend}>Gönder</button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <GoogleOAuthProvider clientId="1098959665337-cbdpf67bc0ur60afs63815km7gm1t9im.apps.googleusercontent.com">
      <AppContent />
    </GoogleOAuthProvider>
  );
}
