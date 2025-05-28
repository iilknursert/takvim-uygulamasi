import { useState } from "react";
import "../TakvimGorunum.css";
import { useEffect } from "react";
import YanPanel from "./YanPanel"; 
import UstMenu from "./UstMenu";
import ToastBildirim from "./ToastBildirim";
import SagPanel from "./SagPanel";



// UTC yerine yerel ISO formatı üretir
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

const TakvimGorunum = ({
  kullaniciAdi,
  gorunurTakvimler,
  yanPanelAcik,
  digerTakvimler,
  modalAcik,
  setModalAcik,
  modalCoords,
  setModalCoords,
  modalPosition,
  setModalPosition,
  etkinlikTarihi,
  setEtkinlikTarihi,
  bitisTarihi,
  setBitisTarihi,
}) => {

  const [gorunum, setGorunum] = useState("haftalik");
  const [tarih, setTarih] = useState(new Date());
  const [secilenGun, setSecilenGun] = useState(null);
  const [secilenSaat, setSecilenSaat] = useState(null);
  
  const [etkinlikAdi, setEtkinlikAdi] = useState("");
  
  const [etkinlikModal, setEtkinlikModal] = useState(false);
  const [seciliYilGunu, setSeciliYilGunu] = useState(null);
  const [etkinlikler, setEtkinlikler] = useState([]);

  const [aciklama, setAciklama] = useState("");
  const [renk, setRenk] = useState("#000000");
  const [tema, setTema] = useState(() => localStorage.getItem("tema") || "acik");
const [temaRenk, setTemaRenk] = useState(() => localStorage.getItem("temaRenk") || "#A7C7E7");

const gorevler = etkinlikler.filter((e) => e.takvim === "Görev");


const [oncelik, setOncelik] = useState("Orta");
const [etiket, setEtiket] = useState("");

  const [tekrarlansinMi, setTekrarlansinMi] = useState(false);
  const [hatirlatma, setHatirlatma] = useState(false);
  const [zamanAcik, setZamanAcik] = useState(false);
  const [tekrarlamaTipi, setTekrarlamaTipi] = useState("yok");
  
  const [saatAcik, setSaatAcik] = useState(false);
  const [aciklamaGoster, setAciklamaGoster] = useState(false);
  const [tekrarTipi, setTekrarTipi] = useState("yok"); // dropdown için
const [tekrarSikligi, setTekrarSikligi] = useState(1);
const [tekrarBirimi, setTekrarBirimi] = useState("hafta");
const [secilenGunler, setSecilenGunler] = useState([]);
const [bitisTuru, setBitisTuru] = useState("hicbirZaman");
const [tekrarSayisi, setTekrarSayisi] = useState(1);
const [ozelTekrarPenceresiAcik, setOzelTekrarPenceresiAcik] = useState(false);
const [yukleniyor, setYukleniyor] = useState(false);
const [hataMesaji, setHataMesaji] = useState("");
const [seciliTakvim, setSeciliTakvim] = useState("Etkinlik"); // varsayılan
const [duzenlenenEtkinlikId, setDuzenlenenEtkinlikId] = useState(null);
const [tekrarDuzenlemeSecimi, setTekrarDuzenlemeSecimi] = useState("tum"); // "tum" veya "yalnizca"
const [sonTiklananGun, setSonTiklananGun] = useState(null);
const [tiklanmaSayisi, setTiklanmaSayisi] = useState(0);

const [kullaniciTakvimleri, setKullaniciTakvimleri] = useState([
  "Etkinlik",
  "Görev",
  "Doğum günü",
  // Eklenen takvimler buraya eklenecek"
]); 

const basicHeaders = {
  "Content-Type": "application/json",
  "Authorization": "Basic " + btoa("testuser:1234")
};


const tekrarlayanEtkinlikleriUret = () => {
  const tekrarliEtkinlikler = [];

  etkinlikler.forEach((etkinlik) => {
    if (!etkinlik.repeat || etkinlik.repeat.tipi === "yok") {
      tekrarliEtkinlikler.push(etkinlik);
      return;
    }

    const baslangic = new Date(etkinlik.start);
    const bitis = etkinlik.endTime
      ? new Date(etkinlik.endTime)
      : new Date(baslangic.getTime() + 60 * 60 * 1000);

    const haftaBasi = new Date(tarih);
    haftaBasi.setDate(
      haftaBasi.getDate() - (haftaBasi.getDay() === 0 ? 6 : haftaBasi.getDay() - 1)
    );

    for (let i = 0; i < 7; i++) {
      const gun = new Date(haftaBasi);
      gun.setDate(haftaBasi.getDate() + i);
      const gunGunu = gun.getDay();

      const yeniBaslangic = new Date(gun);
      yeniBaslangic.setHours(baslangic.getHours(), baslangic.getMinutes());
      const yeniBitis = new Date(gun);
      yeniBitis.setHours(bitis.getHours(), bitis.getMinutes());

      const etkinlikEkle = () => {
        const zatenVar = tekrarliEtkinlikler.some(
          (evt) => new Date(evt.start).getTime() === yeniBaslangic.getTime()
        );
        const isException = etkinlik.exceptions?.some(
          (exc) => new Date(exc).getTime() === yeniBaslangic.getTime()
        );
        if (!zatenVar && !isException) {
          tekrarliEtkinlikler.push({
            ...etkinlik,
            start: yeniBaslangic.toISOString(),
            endTime: yeniBitis.toISOString(),
            _tekrarli: true,
          });
        }
      };

      if (etkinlik.repeat.tipi === "herGun") etkinlikEkle();
      if (etkinlik.repeat.tipi === "haftaIci" && gunGunu >= 1 && gunGunu <= 5) etkinlikEkle();
      if (etkinlik.repeat.tipi === "herHaftaSali" && gunGunu === 2) etkinlikEkle();

      if (etkinlik.repeat.tipi === "herAy4Sali") {
        const ay = tarih.getMonth();
        const yil = tarih.getFullYear();
        const salilar = [];
        for (let d = 1; d <= 31; d++) {
          const date = new Date(yil, ay, d);
          if (date.getMonth() !== ay) break;
          if (date.getDay() === 2) salilar.push(date);
        }
        const dorduncuSali = salilar[3];
        if (dorduncuSali && dorduncuSali.toDateString() === gun.toDateString()) etkinlikEkle();
      }

      if (etkinlik.repeat.tipi === "herAySonSali") {
        const ay = tarih.getMonth();
        const yil = tarih.getFullYear();
        const salilar = [];
        for (let d = 1; d <= 31; d++) {
          const date = new Date(yil, ay, d);
          if (date.getMonth() !== ay) break;
          if (date.getDay() === 2) salilar.push(date);
        }
        const sonSali = salilar[salilar.length - 1];
        if (sonSali && sonSali.toDateString() === gun.toDateString()) etkinlikEkle();
      }

      if (etkinlik.repeat.tipi === "herYil") {
        const yilin25Marti = new Date(tarih.getFullYear(), 2, 25);
        if (yilin25Marti.toDateString() === gun.toDateString()) etkinlikEkle();
      }

      if (etkinlik.repeat.tipi === "ozel" && etkinlik.repeat.birim === "hafta") {
        const siklik = etkinlik.repeat.siklik || 1;
        const secilenGunler = etkinlik.repeat.secilenGunler || [];

        if (secilenGunler.includes(gunGunu)) {
          const haftalarFarki = Math.floor((gun - baslangic) / (7 * 24 * 60 * 60 * 1000));
          if (haftalarFarki >= 0 && haftalarFarki % siklik === 0) {
            etkinlikEkle();
          }
        }
      }
    }
  });

  return tekrarliEtkinlikler;
};



const gunAdlariTR = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

const gunSirasiBul = (date) => {
  const gunTarihi = date.getDate();
  return Math.floor((gunTarihi - 1) / 7) + 1;
};

const dinamikTekrarOpsiyonlari = () => {
  if (!etkinlikTarihi) return [];

  const seciliTarih = new Date(etkinlikTarihi);
  const gunIndex = seciliTarih.getDay(); // 0 = Pazar
  const gunAdi = gunAdlariTR[gunIndex];
  const ayinKaci = seciliTarih.getDate();
  const ayAdi = seciliTarih.toLocaleDateString("tr-TR", { month: "long" });
  const kacinciGun = gunSirasiBul(seciliTarih);

  return [
    { value: "yok", label: "Tekrarlanmaz" },
    { value: "herGun", label: "Her gün" },
    { value: `herHafta${gunAdi}`, label: `Her hafta ${gunAdi}` },
    { value: `herAy${kacinciGun}${gunAdi}`, label: `Her ayın ${kacinciGun}. ${gunAdi}` },
    { value: `herAySon${gunAdi}`, label: `Her ayın son ${gunAdi}` },
    { value: "herYil", label: `Her yıl ${ayinKaci} ${ayAdi}` },
    { value: "haftaIci", label: "Hafta içi her gün" },
    { value: "ozel", label: "Özel..." },
  ];
};

const etkinlikSil = async (id, _tekrarli = false, instanceDate = null) => {
  if (_tekrarli && instanceDate) {
    const etkinlik = etkinlikler.find((e) => e.id === id);
    if (!etkinlik) return;

    // instanceDate güvenli biçimde: "2025-05-11T02:00:00" (ISO 8601, saniyesiz)
    const temizTarih = new Date(instanceDate).toISOString().replace(/:\d{2}\.\d+Z$/, "");


    const mevcutExceptions = Array.isArray(etkinlik.exceptions) ? etkinlik.exceptions : [];
    if (mevcutExceptions.includes(temizTarih)) {
      gosterToast("Bu örnek zaten silinmiş.");
      return;
    }

    const guncelEtkinlik = {
      ...etkinlik,
      exceptions: [...mevcutExceptions, temizTarih],
      duzenlemeModu: "yalnizca",
    };

    try {
      const res = await fetch(`http://localhost:9191/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("testuser:1234"),
        },
        body: JSON.stringify(guncelEtkinlik),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız");

      const veri = await res.json();
      setEtkinlikler((prev) => prev.map((e) => (e.id === id ? veri : e)));
      gosterToast("Sadece bu örnek silindi ✅");
    } catch (err) {
      console.error("Sadece örnek silinirken hata:", err);
      gosterToast("Sadece bu örnek silinemedi.");
    }

    return;
  }

  // 🔁 Normal silme (tümünü)
  if (!id) {
    gosterToast("Geçersiz etkinlik. Silinemiyor.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:9191/api/events/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Basic " + btoa("testuser:1234"),
      },
    });

    if (!res.ok) throw new Error("Silme başarısız");

    setEtkinlikler((prev) => prev.filter((e) => e.id !== id));
    gosterToast("Etkinlik silindi ✅");
  } catch (err) {
    console.error("Etkinlik silinirken hata:", err);
    gosterToast("Etkinlik silinemedi.");
  }
};




  const pastelRenkSecenekleri = [
    "#A7C7E7", // Pastel Mavi
    "#C1E1C1", // Pastel Yeşil
    "#F7C6C7", // Pastel Pembe
    "#FCE1A8", // Pastel Sarı
    "#E7D3F2", // Pastel Mor
    "#FFD1DC", // Pastel Gül
    "#EAD7A1", // Pastel Bej
    "#B5EAD7", // Nane Yeşili
  ];

  const handleYillikGuneTikla = (gun, e) => {
    const rect = e.target.getBoundingClientRect();
    const solMu = rect.left > window.innerWidth / 2;
    const topCoord = rect.top + window.scrollY + 30;
    const leftCoord = rect.left;
  
    setModalCoords({
      top: topCoord,
      left: solMu ? undefined : leftCoord,
      right: solMu ? window.innerWidth - rect.left : undefined
    });
    setModalPosition(solMu ? "left" : "right");
    setSeciliYilGunu(gun);
    setEtkinlikModal(true);
  };
  
  
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMesaj, setToastMesaj] = useState("");

  const gosterToast = (mesaj) => {
    setToastMesaj(mesaj);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const gonderBildirim = (baslik, icerik) => {
    if (Notification.permission === "granted") {
      new Notification(baslik, {
        body: icerik,
        icon: "/logo192.png", // varsa logonu koyabilirsin
      });
    }
  };
  


  const gunler = ["PZT", "SAL", "ÇAR", "PER", "CUM", "CMT", "PAZ"];

  const buguneGit = () => {
    setTarih(new Date());
  };

  const handleGunTiklama = (tiklananGun) => {
    const oncekiGun = sonTiklananGun;
    const ayniGunMu =
      oncekiGun &&
      tiklananGun.getDate() === oncekiGun.getDate() &&
      tiklananGun.getMonth() === oncekiGun.getMonth() &&
      tiklananGun.getFullYear() === oncekiGun.getFullYear();
  
    if (ayniGunMu) {
      setTiklanmaSayisi(prev => prev + 1);
      if (tiklanmaSayisi + 1 === 2) {
        setGorunum("gunluk");
        setTarih(tiklananGun);
        setTiklanmaSayisi(0); // sıfırla
      }
    } else {
      setSonTiklananGun(tiklananGun);
      setTiklanmaSayisi(1);
    }
  };
  

  const handleGeri = () => {
    const yeniTarih = new Date(tarih);
    if (gorunum === "gunluk") {
      yeniTarih.setDate(yeniTarih.getDate() - 1);
    } else if (gorunum === "haftalik") {
      yeniTarih.setDate(yeniTarih.getDate() - 7);
    } else if (gorunum === "aylik") {
      yeniTarih.setMonth(yeniTarih.getMonth() - 1);
    } else if (gorunum === "yillik") {
      yeniTarih.setFullYear(yeniTarih.getFullYear() - 1);
    }
    setTarih(yeniTarih);
  };

  const [suaninKonumu, setSuaninKonumu] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      // Her dakika kontrol et
      const simdi = new Date();
      // Etkinliklerinizi dolaşın, örneğin:
      etkinlikler.forEach((etkinlik) => {
        const etkinlikZamani = new Date(etkinlik.start);
        // Örneğin, eğer etkinlik 5 dakika içinde başlıyorsa bildirim gönder
        const fark = (etkinlikZamani - simdi) / 60000;
        if (fark > 0 && fark <= 5 && !etkinlik.hatirlatildi) {
          gonderBildirim("Hatırlatma", `${etkinlik.title} için 5 dakika kaldı!`);
          etkinlik.hatirlatildi = true;
          fetch(`http://localhost:9191/api/events/${etkinlik.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Basic " + btoa("testuser:1234")
            },
            body: JSON.stringify(etkinlik),
          });

        }
        
      });
    }, 60000);
  
    return () => clearInterval(interval);
  }, [etkinlikler]);

  
useEffect(() => {
  const suaniHesapla = () => {
    const now = new Date();
    const saat = now.getHours();
    const dakika = now.getMinutes();
    const top = (saat * 60 + dakika); // her dakika = 1px (örnek)
    setSuaninKonumu(top);
  };

  suaniHesapla(); // ilk çağrı
  const interval = setInterval(suaniHesapla, 60000); // her dakika güncelle

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  localStorage.setItem("tema", tema);
}, [tema]);

useEffect(() => {
  localStorage.setItem("temaRenk", temaRenk);
}, [temaRenk]);

useEffect(() => {
  document.body.setAttribute("data-tema", tema);
}, [tema]);

useEffect(() => {
  document.documentElement.style.setProperty("--tema-rengi", temaRenk);
}, [temaRenk]);

useEffect(() => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}, []);

useEffect(() => {
  const varsayilanlar = ["Etkinlik", "Görev", "Doğum günü"];
  const tumTakvimler = [...varsayilanlar, ...digerTakvimler];
  setKullaniciTakvimleri(tumTakvimler);
}, [digerTakvimler]);


useEffect(() => {
  const kayitliGorunum = localStorage.getItem("gorunum");
  const kayitliTarih = localStorage.getItem("gunlukTarih");

  if (kayitliGorunum && kayitliTarih) {
    setGorunum(kayitliGorunum);
    setTarih(new Date(kayitliTarih));
    localStorage.removeItem("gorunum");
    localStorage.removeItem("gunlukTarih");
  }
}, []);

  const handleIleri = () => {
    const yeniTarih = new Date(tarih);
    if (gorunum === "gunluk") {
      yeniTarih.setDate(yeniTarih.getDate() + 1);
    } else if (gorunum === "haftalik") {
      yeniTarih.setDate(yeniTarih.getDate() + 7);
    } else if (gorunum === "aylik") {
      yeniTarih.setMonth(yeniTarih.getMonth() + 1);
    } else if (gorunum === "yillik") {
      yeniTarih.setFullYear(yeniTarih.getFullYear() + 1);
    }
    setTarih(yeniTarih);
  };

  const baslangicTarihi = new Date(tarih);
  baslangicTarihi.setDate(
    baslangicTarihi.getDate() - (baslangicTarihi.getDay() === 0 ? 6 : baslangicTarihi.getDay() - 1)
  );

  const haftaTarihleri = Array.from({ length: 7 }, (_, i) => {
    const yeniTarih = new Date(baslangicTarihi);
    yeniTarih.setDate(baslangicTarihi.getDate() + i);
    return yeniTarih;
  });

  const formatSaat = (hour) => {
    if (hour === 0) return "";
    let saat = hour % 12 || 12;
    let amPm = hour < 12 ? "AM" : "PM";
    return `${saat} ${amPm}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleString("tr-TR", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });
  };
  

  const etkinlikEkle = (gunIndex, saat, e) => {
    setSecilenGun(gunIndex);
    setSecilenSaat(saat);
  
    const seciliTarih = new Date(haftaTarihleri[gunIndex]);
    seciliTarih.setHours(saat, 0, 0, 0);
    const bitis = new Date(seciliTarih);
    bitis.setHours(bitis.getHours() + 1);
  
    setEtkinlikTarihi(seciliTarih.toISOString());
    setBitisTarihi(bitis.toISOString());

  
    const rect = e.target.getBoundingClientRect();
    const ekranGenisligi = window.innerWidth;
    const ekranYuksekligi = window.innerHeight;
  
    const solMu = rect.left > ekranGenisligi / 2;
    const altMi = rect.top + 200 > ekranYuksekligi; // 200 → modal yüksekliği
    let leftCoord = rect.left + (solMu ? -360 : 0); // modal genişliği yaklaşık 350-360
    let topCoord = altMi ? rect.top + window.scrollY - 200 : rect.top + window.scrollY + 30;
    
    // Eğer sağa taşarsa sağdan sınırla
    const maxLeft = window.innerWidth - 370; // modal genişliği + padding
    if (leftCoord > maxLeft) leftCoord = maxLeft;
    if (leftCoord < 10) leftCoord = 10; // sola çok yaslanmasın
    
    // Yukarıdan ve aşağıdan taşmayı engelle
    const maxTop = window.innerHeight + window.scrollY - 300;
    if (topCoord > maxTop) topCoord = maxTop;
    if (topCoord < 10 + window.scrollY) topCoord = 10 + window.scrollY;
    
    setModalCoords({
      top: topCoord,
      left: leftCoord,
    });

  
    setModalAcik(true);
    setSaatAcik(false);
    setAciklamaGoster(false);
  };
  
  useEffect(() => {
    fetch("http://localhost:9191/api/events", {
      headers: {
        "Authorization": "Basic " + btoa("testuser:1234")
      }
    })
      .then((res) => res.json())
      .then((data) => {
    const duzenlenmis = data.map((e) => {
    const bitis = e.endTime ? new Date(e.endTime) : new Date(new Date(e.start).getTime() + 60 * 60 * 1000);
    return {
      ...e,
      endTime: bitis.toISOString(),
    };
  });
  setEtkinlikler(duzenlenmis);
})

      .catch((err) => {
        console.error("Etkinlikler yüklenirken hata:", err);
      });
  }, []);
  

  useEffect(() => {
    localStorage.setItem("etkinlikler", JSON.stringify(etkinlikler));
  }, [etkinlikler]);
  
  const etkinlikDuzenle = (etkinlik) => {
    setDuzenlenenEtkinlikId(etkinlik.id);
    setEtkinlikAdi(etkinlik.title);
    setAciklama(etkinlik.description);
    setEtkinlikTarihi(etkinlik.start);
    setBitisTarihi(etkinlik.endTime);
    setRenk(etkinlik.renk || etkinlik.color);
    setSeciliTakvim(etkinlik.takvim);
    setModalAcik(true);
    setOncelik(etkinlik.oncelik || "Orta");
    setEtiket(etkinlik.etiket || "");

  };
  
  const etkinlikKaydet = async () => {
    console.log("💾 etkinlikKaydet fonksiyonu çalıştı");
  
    if (!etkinlikAdi.trim()) return;
  
    const baslangic = new Date(etkinlikTarihi);
    const bitis = bitisTarihi ? new Date(bitisTarihi) : new Date(baslangic.getTime() + 60 * 60 * 1000);

    const yeniEtkinlik = {
      title: etkinlikAdi,
  description: aciklama,
  start: etkinlikTarihi, // zaten string
  endTime: bitisTarihi,
  color: renk,
  takvim: seciliTakvim || kullaniciAdi, // kullanıcı takvimi varsayılan
  duzenlemeModu: tekrarDuzenlemeSecimi,
  hatirlatildi: false, // ❗ yeni eklendi
  repeat: {
    tipi: tekrarTipi,
    siklik: Number(tekrarSikligi),
    birim: tekrarBirimi,
    bitisTuru: bitisTuru,
    tekrarSayisi: Number(tekrarSayisi),
    bitisTarihi: bitisTarihi,
    oncelik: oncelik,
    etiket: etiket,
      }
    };

  console.log("📦 Yeni etkinlik:", JSON.stringify(yeniEtkinlik, null, 2)); // ← BUNU EKLE
    setYukleniyor(true);
    setHataMesaji("");
  
    try {
      const method = duzenlenenEtkinlikId ? "PUT" : "POST";
      const url = duzenlenenEtkinlikId
        ? `http://localhost:9191/api/events/${duzenlenenEtkinlikId}`
        : "http://localhost:9191/api/events";
  
      console.log("📤 Sunucuya gönderilen veri:", yeniEtkinlik);
      console.log("🛠 Yöntem:", method, "URL:", url);
  
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + btoa("testuser:1234")
        },
        body: JSON.stringify(yeniEtkinlik),
      });
      
  
      if (!response.ok) {
        throw new Error("Etkinlik kaydedilemedi.");
      }
  
      const kaydedilen = await response.json();
      console.log("✅ Kaydedilen etkinlik:", kaydedilen);
  
      if (method === "PUT") {
        setEtkinlikler((prev) =>
          prev.map((e) => (e.id === kaydedilen.id ? kaydedilen : e))
        );
      } else {
        setEtkinlikler((prev) => [...prev, kaydedilen]);
      }
  
      gosterToast("Etkinlik başarıyla kaydedildi!");

      // Temizlik
      setModalAcik(false);
      setEtkinlikAdi("");
      setEtkinlikTarihi("");
      setBitisTarihi("");
      setAciklama("");
      setDuzenlenenEtkinlikId(null);
  
    } catch (err) {
      console.error("Hata:", err);
      setHataMesaji("Etkinlik kaydedilirken hata oluştu.");
    } finally {
      setYukleniyor(false);
    }
  };
  
  
  
  
  const olusturButonunaTikla = () => {
    const simdi = new Date();
    const baslangic = new Date(simdi);
    baslangic.setHours(9, 0, 0, 0); // örnek: 09:00
  
    const bitis = new Date(baslangic);
    bitis.setHours(bitis.getHours() + 1); // 1 saatlik etkinlik
  
    setSecilenGun(null); // haftalık görünümde değil, serbest
    setSecilenSaat(null);
  
    setEtkinlikTarihi(baslangic.toISOString());
    setBitisTarihi(bitis.toISOString());

  
    // modalı ortala
    setModalCoords({
      top: window.innerHeight / 2 - 200,
      left: window.innerWidth / 2 - 175,
    });
  
    setModalPosition("center"); // özel sınıf tanımlayabilirsin istersen
    setModalAcik(true);
    setSaatAcik(false);
    setAciklamaGoster(false);
  };
  
  

  return (
    <div className="takvim-container">
      {/* ÜST MENÜ (SABİT) */}
      <div className="takvim-header">
        <div className="sol-kisim">
          <button onClick={buguneGit} className="bugun-btn">Bugün</button>
          <div className="takvim-nav">
            <button onClick={handleGeri} className="nav-btn">‹</button>
            <button onClick={handleIleri} className="nav-btn">›</button>
            <span className="ay-yil">
              {gorunum === "yillik"
                ? tarih.getFullYear()
                : gorunum === "gunluk"
                ? tarih.toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : gorunum === "haftalik"
                ? (() => {
                    const aylar = haftaTarihleri.map((t) =>
                      t.toLocaleDateString("tr-TR", { month: "long" })
                    );
                    const uniqueAylar = [...new Set(aylar)];
                    const yil = tarih.getFullYear();
                    return uniqueAylar.length === 1
                      ? `${uniqueAylar[0]} ${yil}`
                      : `${uniqueAylar[0]} - ${uniqueAylar[1]} ${yil}`;
                  })()
                : tarih.toLocaleDateString("tr-TR", {
                    month: "long",
                    year: "numeric",
                  })}
            </span>
          </div>
        </div>
        <div className="gorunum-secici">
          <select
            value={gorunum}
            onChange={(e) => setGorunum(e.target.value)}
            className="gorunum-dropdown"
          >
            <option value="gunluk">Günlük</option>
            <option value="haftalik">Haftalık</option>
            <option value="aylik">Aylık</option>
            <option value="yillik">Yıllık</option>
          </select>
        </div>
      </div>
    
      <div className={`takvim-gorunum ${gorunum === "yillik" ? "yillik-scroll" : ""}`}>

      {gorunum === "haftalik" && (
  <>
    <div className="gunler-row">
      
      <div className="gun-bosluk"></div>
      {haftaTarihleri.map((gun, index) => {
        const bugun = new Date();
        const isBugun =
          gun.getDate() === bugun.getDate() &&
          gun.getMonth() === bugun.getMonth() &&
          gun.getFullYear() === bugun.getFullYear();

        return (
          <div key={index} className="gun-kutu">
            <span className="gun-adi">{gunler[index]}</span>
            <span
            className={`gun-tarihi ${isBugun ? "bugun-halka" : ""}`}
            onClick={() => handleGunTiklama(gun)}
          >
            {gun.getDate()}
          </span>
          </div>
        );
      })}
    </div>
  
    <div className="takvim-grid">
      <div className="saat-cizelgesi">
        {[...Array(24)].map((_, i) => (
          <div key={i} className="saat-kutu">{formatSaat(i)}</div>
        ))}
      </div>

      <div className="gunler-icerik">
        {haftaTarihleri.map((gun, gunIndex) => {
          const bugun = new Date();
          const isBugun =
            gun.getDate() === bugun.getDate() &&
            gun.getMonth() === bugun.getMonth() &&
            gun.getFullYear() === bugun.getFullYear();
          const suaninKonumu = bugun.getHours() * 60 + bugun.getMinutes();

          return (
            <div key={gunIndex} className="gun-icerik">
              {/* ŞU AN ÇİZGİSİ */}
              {isBugun && (
                <div className="suan-cizgisi" style={{ top: `${suaninKonumu}px` }}>
                  <div className="suan-nokta"></div>
                </div>
              )}

                {[...Array(24)].map((_, hour) => (
                  <div
                    key={hour}
                    className={`gun-saat-kutu ${secilenGun === gunIndex && secilenSaat === hour && modalAcik ? "highlight" : ""}`}
                    onClick={(e) => etkinlikEkle(gunIndex, hour, e)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const etkinlikId = e.dataTransfer.getData("etkinlikId");
                      if (etkinlikId) {
                        const yeniTarih = new Date(haftaTarihleri[gunIndex]);
                        yeniTarih.setHours(hour, 0, 0, 0);

                        const yeniBitis = new Date(yeniTarih);
                        yeniBitis.setHours(yeniBitis.getHours() + 1);

                
                        const guncellenmis = etkinlikler.map((etk) =>
                          etk.id == etkinlikId
                            ? {
                                ...etk,
                                start: toLocalISOString(yeniTarih),
                                endTime: toLocalISOString(yeniBitis),
                              }
                            : etk
                        );
                
                        setEtkinlikler(guncellenmis);
                
                        fetch(`http://localhost:9191/api/events/${etkinlikId}`, {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Basic " + btoa("testuser:1234")
                          },
                          body: JSON.stringify(
                            guncellenmis.find((etk) => etk.id == etkinlikId)
                          ),
                        }).then((res) => {
                          if (!res.ok) console.error("Güncelleme başarısız");
                        });
                      }
                    }}
                  >
                
                  {tekrarlayanEtkinlikleriUret()
                      .filter((e) => {
                        if (!e.start) return false;
                        const startDate = new Date(e.start);
                        const etkinlikGunu = startDate.toDateString();
                        const aktifGunu = gun.toDateString();

                        const isSameDay = etkinlikGunu === aktifGunu;
                        const isSameHour = startDate.getHours() === hour;

                        return gorunurTakvimler[e.takvim] && isSameDay && isSameHour;
                      })
                      .map((e, i) => (
                        <div
                      key={i}
                      className="etkinlik"
                      style={{ backgroundColor: e.renk || e.color }}
                      draggable
                      onDragStart={(evt) => {
                        evt.dataTransfer.setData("etkinlikId", e.id); // etkinlik ID'sini aktar
                      }}
                      onClick={() => etkinlikDuzenle(e)}
                    >
                      <span>{e.title}</span>
                     <button
                      onClick={(evt) => {
                        evt.stopPropagation();
                        if (e._tekrarli) {
                          const isoStart = new Date(e.start).toISOString().split(".")[0];
                          etkinlikSil(e.id, true, isoStart);
                        } else {
                          etkinlikSil(e.id);
                        }
                      }}
                      className="sil-buton"
                    >
                      🗑
                    </button>



                    </div>
                    ))}
                </div>
              ))}
            </div>
          ); 
        })}
      </div>
    </div>
  </>
)}

{gorunum === "gunluk" && (
  <>
    <div className="gunler-row">
      <div className="gun-kutu">
        <span className="gun-tarihi">{tarih.getDate()}</span>
        <span className="gun-adi">
          {tarih.toLocaleDateString("tr-TR", { weekday: "short" })}
        </span>
      </div>
    </div>

    <div className="takvim-grid">
      <div className="saat-cizelgesi">
        {[...Array(24)].map((_, i) => (
          <div key={i} className="saat-kutu">{formatSaat(i)}</div>
        ))}
      </div>

      <div className="gunler-icerik" style={{ display: "grid", gridTemplateColumns: "1fr", width: "100%" }}>
        <div className="gun-icerik" style={{ width: "100%", flexGrow: 1 }}>
          
          {/* Şu an çizgisi */}
          {(() => {
            const now = new Date();
            const isBugun = now.toDateString() === tarih.toDateString();
            const suaninKonumu = now.getHours() * 60 + now.getMinutes();
            return isBugun && (
              <div className="suan-cizgisi" style={{ top: `${suaninKonumu}px` }}>
                <div className="suan-nokta"></div>
              </div>
            );
          })()}

          {[...Array(24)].map((_, hour) => (
            <div
              key={hour}
              className={`gun-saat-kutu ${secilenGun === 0 && secilenSaat === hour && modalAcik ? "highlight" : ""}`}
              onClick={(e) => etkinlikEkle(0, hour, e)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const etkinlikId = e.dataTransfer.getData("etkinlikId");
                if (etkinlikId) {
                  const yeniTarih = new Date(tarih);
                  yeniTarih.setHours(hour, 0, 0, 0);
                  const yeniBitis = new Date(yeniTarih);
                  yeniBitis.setHours(yeniBitis.getHours() + 1);

                  const guncellenmis = etkinlikler.map((etk) =>
                    etk.id == etkinlikId
                      ? {
                          ...etk,
                          start: toLocalISOString(yeniTarih),
                          endTime: toLocalISOString(yeniBitis),
                        }
                      : etk
                  );

                  setEtkinlikler(guncellenmis);

                  fetch(`http://localhost:9191/api/events/${etkinlikId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(guncellenmis.find((etk) => etk.id == etkinlikId)),
                  }).then((res) => {
                    if (!res.ok) console.error("Güncelleme başarısız");
                  });
                }
              }}
            >
              {etkinlikler
                .filter((e) => {
                  if (!e.start) return false;
                  const startDate = new Date(e.start);
                  return (
                    gorunurTakvimler[e.takvim] &&
                    startDate.getDate() === tarih.getDate() &&
                    startDate.getMonth() === tarih.getMonth() &&
                    startDate.getFullYear() === tarih.getFullYear() &&
                    startDate.getHours() === hour
                  );
                })
                .map((e, i) => (
                  <div
                    key={i}
                    className="etkinlik"
                    style={{
                      backgroundColor: e.renk || e.color,
                      position: "relative",
                    }}
                    draggable
                    onDragStart={(evt) => {
                      evt.dataTransfer.setData("etkinlikId", e.id);
                    }}
                    onClick={() => etkinlikDuzenle(e)}
                  >
                    {e.title}
                    <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      if (e._tekrarli) {
                        const isoStart = new Date(e.start).toISOString().split(".")[0];
                        etkinlikSil(e.id, true, isoStart);
                      } else {
                        etkinlikSil(e.id);
                      }
                    }}

                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
)}

{gorunum === "aylik" && (
  <>
    
    <div className="takvim-grid-aylik">
  {Array.from({ length: 42 }, (_, i) => {
    const ilkGun = new Date(tarih.getFullYear(), tarih.getMonth(), 1);
    const baslangicGun = new Date(ilkGun);
    baslangicGun.setDate(ilkGun.getDate() - (ilkGun.getDay() === 0 ? 6 : ilkGun.getDay() - 1));
    const gun = new Date(baslangicGun);
    gun.setDate(baslangicGun.getDate() + i);

    const gunNumarasi = gun.getDate();
    const bugununTarihi = new Date();
    const ayniGunMu =
      gun.getDate() === bugununTarihi.getDate() &&
      gun.getMonth() === bugununTarihi.getMonth() &&
      gun.getFullYear() === bugununTarihi.getFullYear();

    const gunAdi = gun.toLocaleDateString("tr-TR", { weekday: "short" });

    return (
      <div
        key={i}
        className={`aylik-gun-kutu ${gun.getMonth() !== tarih.getMonth() ? "baska-ay" : ""}`}
        onClick={() => handleGunTiklama(gun)}

      >
        
        {i < 7 && <div className="gun-isim-aylik">{gunAdi.toUpperCase()}</div>}
        <div className={`gun-numara-aylik ${ayniGunMu ? "bugun-aylik" : ""}`}>{gunNumarasi}</div>
      </div>
    );
    
  })}
</div>

  </>
)}

{gorunum === "yillik" && (
  <div className="yillik-grid">
    {Array.from({ length: 12 }, (_, ayIndex) => {
      const ayTarihi = new Date(tarih.getFullYear(), ayIndex, 1);
      const baslangicGun = new Date(ayTarihi);
      baslangicGun.setDate(1 - (baslangicGun.getDay() === 0 ? 6 : baslangicGun.getDay() - 1));

      const gunler = Array.from({ length: 42 }, (_, i) => {
        const gun = new Date(baslangicGun);
        gun.setDate(baslangicGun.getDate() + i);
        return gun;
      });

      return (
        <div
          className={`yillik-ay-kutu ${ayIndex === new Date().getMonth() ? "aktif-ay" : ""}`}
          key={ayIndex}
        >
          <div className="yillik-ay-baslik">
            {ayTarihi.toLocaleDateString("tr-TR", { month: "long" })}
          </div>
          <div className="yillik-hafta-basliklari">
            {["P", "S", "Ç", "P", "C", "C", "P"].map((gun, i) => (
              <div key={i} className="yillik-gun-isim">{gun}</div>
            ))}
          </div>
          <div className="yillik-ay-icerik">
            {gunler.map((gun, i) => {
              const bugun = new Date();
              const isBugun =
                gun.getDate() === bugun.getDate() &&
                gun.getMonth() === bugun.getMonth() &&
                gun.getFullYear() === bugun.getFullYear();
              const baskaAyMi = gun.getMonth() !== ayIndex;

              return (
                <div
                  key={i}
                  className={`yillik-gun-kutu ${isBugun ? "yillik-bugun" : ""} ${baskaAyMi ? "baska-ay" : ""}`}
                  onClick={() => handleGunTiklama(gun)}
                >
                  {gun.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
)}

{etkinlikModal && seciliYilGunu && (
  <div
    className="yillik-etkinlik-popup"
    style={{
      top: modalCoords.top,
      left: modalCoords.left,
      position: "absolute",
      zIndex: 9999,
    }}
  >
    <div className="yillik-popup-header">
      <div className="yillik-popup-gun">
        <div className="gun-circle">
          <div>{seciliYilGunu.getDate()}</div>
        </div>
        <span>{seciliYilGunu.toLocaleDateString("tr-TR", { weekday: "short" }).toUpperCase()}</span>
      </div>
      <button className="popup-close" onClick={() => setEtkinlikModal(false)}>×</button>
    </div>

    <div className="yillik-popup-icerik">
          {etkinlikler.filter(e =>
        new Date(e.start).toDateString() === seciliYilGunu.toDateString() &&
        gorunurTakvimler[e.takvim]).map((e, i) => (
        <div key={i} className="etkinlik-satir">
          <span className="renk-dot" style={{ backgroundColor: e.renk || e.color }}></span>
          <span className="etkinlik-saat">
            {new Date(e.start).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="etkinlik-isim">{e.title}</span>
        </div>
      ))}

      {etkinlikler.filter(e =>
        new Date(e.start).toDateString() === seciliYilGunu.toDateString()
      ).length === 0 && <p>Etkinlik bulunamadı</p>}
    </div>
  </div>
)}


{/* Modal: seçilen yıl gününe ait etkinlikleri göster */}
{etkinlikModal && (
  <div className="modal-overlay" onClick={() => setEtkinlikModal(false)}>
    <div className="modal-google-style" style={{ maxWidth: 400 }}>
      <div className="modal-header">
        <strong>{seciliYilGunu?.toLocaleDateString("tr-TR")} Etkinlikleri</strong>
        <button className="modal-close" onClick={() => setEtkinlikModal(false)}>×</button>
      </div>

      <div className="modal-body">
        {etkinlikler.some(e =>
          new Date(e.start).toDateString() === seciliYilGunu?.toDateString()
        ) ? (
          etkinlikler
            .filter(e =>
              new Date(e.start).toDateString() === seciliYilGunu?.toDateString()
            )
            .map((e, i) => (
              <div
                key={i}
                className="etkinlik"
                style={{
                  backgroundColor: e.color,
                  padding: "8px 12px",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  color: "#333",
                  fontWeight: 500,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
  <span
    style={{
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      backgroundColor: e.color,
      display: "inline-block",
    }}
  ></span>
  {e.title}
  <button
  onClick={(ev) => {
    ev.stopPropagation();
    if (e._tekrarli) {
      const isoStart = new Date(e.start).toISOString().split(".")[0];
      etkinlikSil(e.id, true, isoStart);
    } else {
      etkinlikSil(e.id);
    }
  }}
  className="sil-buton"
>🗑</button>

</div>

              </div>
            ))
        ) : (
          <p>Bu gün için kayıtlı etkinlik yok.</p>
        )}
      </div>
    </div>
  </div>
)}


{modalAcik && (
  <div
    className="modal-overlay"
    onClick={(e) => {
      if (e.target.className === "modal-overlay") setModalAcik(false);
    }}
  >
    <div
      className={`modal-google-style ${modalPosition === "left" ? "left" : "right"}`}
      style={{
        top: modalCoords.top,
        left: modalPosition === "right" ? modalCoords.left : undefined,
        right: modalPosition === "left" ? window.innerWidth - modalCoords.left - 350 : undefined,
        position: "absolute",
    ...(modalPosition === "center" && {
      transform: "translate(-50%, -50%)",
      left: "50%",
      top: "50%",
    }),
      }}
    >
      {/* Başlık */}
      <div className="modal-header">
          <input
      type="text"
      className="modal-title-input"
      placeholder="Başlık ekle"
      value={etkinlikAdi || ""}
      onChange={(e) => setEtkinlikAdi(e.target.value)}
    />

      </div>

      {/* Sekmeler */}
      {/* SEKME: Takvim seçimleri sağ/sol buton ile */}
<div className="modal-tabs-wrapper">
  <button
    className="kaydir-sol"
    onClick={() => {
      const container = document.querySelector(".kaydirilabilir-tabs");
      container.scrollBy({ left: -120, behavior: "smooth" });
    }}
  >
    ‹
  </button>

  <div className="kaydirilabilir-tabs">
    {kullaniciTakvimleri.map((takvim) => (
      <button
        key={takvim}
        className={`tab ${seciliTakvim === takvim ? "active" : ""}`}
        onClick={() => setSeciliTakvim(takvim)}
      >
        {takvim}
      </button>
    ))}
  </div>

  <button
    className="kaydir-sag"
    onClick={() => {
      const container = document.querySelector(".kaydirilabilir-tabs");
      container.scrollBy({ left: 120, behavior: "smooth" });
    }}
  >
    ›
  </button>
</div>

 {/* Tekrarlayan etkinlik düzenleme seçimi (sadece düzenleme modunda görünür) */}
{duzenlenenEtkinlikId && tekrarTipi !== "yok" && (
  <div className="modal-row">
    <label>Bu etkinliği düzenle:</label>
    <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
      <label>
        <input
          type="radio"
          name="duzenlemeTipi"
          value="tum"
          checked={tekrarDuzenlemeSecimi === "tum"}
          onChange={() => setTekrarDuzenlemeSecimi("tum")}
        />
        Tümünü
      </label>
      <label>
        <input
          type="radio"
          name="duzenlemeTipi"
          value="yalnizca"
          checked={tekrarDuzenlemeSecimi === "yalnizca"}
          onChange={() => setTekrarDuzenlemeSecimi("yalnizca")}
        />
        Yalnızca bu etkinliği
      </label>
    </div>
  </div>
)}


      {/* Saat Bilgisi (tıklanınca açılır) */}
      <div className="modal-row clickable" onClick={() => setSaatAcik(!saatAcik)}>
        <span>🕒 {formatDateTime(etkinlikTarihi)} – {formatDateTime(bitisTarihi)}</span>
        <small>Saat dilimi • {tekrarlansinMi ? "Yinelenir" : "Yinelenmez"}</small>
      </div>

      {saatAcik && (
        <>
          <div className="modal-row time-inputs">
            <input
              type="datetime-local"
              value={etkinlikTarihi || ""}
              onChange={(e) => setEtkinlikTarihi(e.target.value)}
            />
            <input
              type="datetime-local"
              value={bitisTarihi || etkinlikTarihi}
              onChange={(e) => setBitisTarihi(e.target.value)}
            />
          </div>

          <div className="modal-row">
            <label>Yinelenme</label>
            <select
  value={tekrarTipi}
  onChange={(e) => {
    const secim = e.target.value;
    setTekrarTipi(secim);
    if (secim === "ozel") {
      setOzelTekrarPenceresiAcik(true);
    }
  }}
>
  {dinamikTekrarOpsiyonlari().map((opt) => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ))}
</select>

          </div>

          {ozelTekrarPenceresiAcik && (
            <div className="modal-overlay" onClick={() => setOzelTekrarPenceresiAcik(false)}>
              <div
                className="modal-google-style"
                style={{
                  width: 350,
                  padding: 20,
                  borderRadius: 12,
                  background: "#1e1e1e",
                  color: "#fff",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 9999,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3>Özel yinelenme</h3>

                <div className="modal-row">
                  <label>Yineleme sıklığı:</label>
                  <input
                    type="number"
                    min="1"
                    value={tekrarSikligi || 1}
                    onChange={(e) => setTekrarSikligi(e.target.value)}
                    style={{ width: "50px" }}
                  />
                  &nbsp;
                  <select value={tekrarBirimi} onChange={(e) => setTekrarBirimi(e.target.value)}>
                    <option value="gun">gün</option>
                    <option value="hafta">hafta</option>
                    <option value="ay">ay</option>
                    <option value="yil">yıl</option>
                  </select>
                </div>

                <div className="modal-row">
                  <label>Şu günlerde yinelenir:</label>
                  <div className="gun-secici">
                    {["P", "S", "Ç", "P", "C", "C", "P"].map((gun, i) => (
                      <button
                        key={i}
                        className={`gun-btn ${secilenGunler.includes(i) ? "aktif" : ""}`}
                        onClick={() => {
                          setSecilenGunler((prev) =>
                            prev.includes(i) ? prev.filter((g) => g !== i) : [...prev, i]
                          );
                        }}
                      >
                        {gun}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-row">
                  <label>Bitiş:</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="bitis"
                        value="hicbirZaman"
                        checked={bitisTuru === "hicbirZaman"}
                        onChange={() => setBitisTuru("hicbirZaman")}
                      />
                      Hiçbir zaman
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="bitis"
                        value="tarih"
                        checked={bitisTuru === "tarih"}
                        onChange={() => setBitisTuru("tarih")}
                      />
                      Şu tarihte:
                      <input
                        type="date"
                        disabled={bitisTuru !== "tarih"}
                        value={bitisTarihi || ""}
                        onChange={(e) => setBitisTarihi(e.target.value)}
                      />
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="bitis"
                        value="tekrar"
                        checked={bitisTuru === "tekrar"}
                        onChange={() => setBitisTuru("tekrar")}
                      />
                      Yinelenme sayısı:
                      <input
                        type="number"
                        min="1"
                        value={tekrarSayisi || 1}
                        disabled={bitisTuru !== "tekrar"}
                        onChange={(e) => setTekrarSayisi(e.target.value)}
                        style={{ width: "60px" }}
                      />
                      tekrar
                    </label>
                  </div>
                </div>

                <div
                  className="modal-footer"
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <button onClick={() => setOzelTekrarPenceresiAcik(false)}>İptal</button>
                  <button
                    onClick={() => {
                      setOzelTekrarPenceresiAcik(false);
                    }}
                  >
                    Bitti
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Açıklama (tıklanınca açılır) */}
      <div className="modal-row clickable" onClick={() => setAciklamaGoster(!aciklamaGoster)}>
        <span>📝 Açıklama veya ek {aciklamaGoster ? "▲" : "▼"}</span>
      </div>

      {aciklamaGoster && (
        <textarea
          className="modal-textarea"
          placeholder="Açıklama veya Google Drive eki ekle"
          value={aciklama}
          onChange={(e) => setAciklama(e.target.value)}
        />
      )}

            {/* Öncelik alanı */}
      {/* Öncelik alanı sadece Görev seçilirse */}
      {seciliTakvim === "Görev" && (
        <div className="modal-row">
          <label>Öncelik</label>
          <select value={oncelik} onChange={(e) => setOncelik(e.target.value)}>
            <option value="Düşük">Düşük</option>
            <option value="Orta">Orta</option>
            <option value="Yüksek">Yüksek</option>
          </select>
        </div>
      )}

      <div className="modal-row">
        <label className="modal-label"></label>
        <div className="renk-secici-container">
          {pastelRenkSecenekleri.map((renkKod) => (
            <button
              key={renkKod}
              className={`renk-dot ${renk === renkKod ? "secili" : ""}`}
              style={{ backgroundColor: renkKod }}
              onClick={() => setRenk(renkKod)}
            />
          ))}
        </div>
      </div>
      {yukleniyor && <div style={{ color: "gray", margin: "8px 0" }}>Kaydediliyor...</div>}
      {hataMesaji && <div style={{ color: "red", margin: "8px 0" }}>{hataMesaji}</div>}

      <div className="modal-footer">
        <button className="btn-other-options">Diğer seçenekler</button>
        <button
  className="btn-kaydet"
  onClick={() => {
    console.log("🖱️ KAYDET butonuna tıklandı");
    etkinlikKaydet();
  }}
>
  Kaydet
</button>
      </div>
    </div>
  </div>
  )} 
</div>
<ToastBildirim mesaj={toastMesaj} visible={toastVisible} />
</div> 
);
};
export default TakvimGorunum; 