import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FaApple } from "react-icons/fa";

import "../GirisKayitModal.css";


const GirisKayitModal = ({ modalAcik, setModalAcik, seciliSayfa, setKullaniciAdi }) => {
  if (!modalAcik) return null;

  const handleGoogleSuccess = (credentialResponse) => {
    const jwt = credentialResponse.credential;
    const decoded = jwt_decode(jwt);
    const ad = decoded.name || decoded.email.split("@")[0];
    setKullaniciAdi(ad);
    setModalAcik(false);
  };

  const handleGoogleError = () => {
    alert("Google girişi başarısız oldu. Lütfen tekrar deneyin.");
  };

  const handleAppleClick = () => {
    alert("Apple ile giriş şu anda aktif değil.");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-minimal">
        <button className="modal-close" onClick={() => setModalAcik(false)}>✖</button>
        <h2 className="modal-title-minimal">
          {seciliSayfa === "giris" ? "Giriş Yap" : "Kayıt Ol"}
        </h2>

        <div className="modal-or-minimal"><span>Giriş yöntemini seç</span></div>

        <div className="social-buttons">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            width="280"
          />

          <button onClick={handleAppleClick}>
            <FaApple size={20} style={{ marginRight: 8 }} />
            Apple ile Giriş
          </button>
        </div>
      </div>
    </div>
  );
};

export default GirisKayitModal;
