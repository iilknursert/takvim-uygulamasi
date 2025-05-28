import { useGoogleLogin } from "@react-oauth/google";
import { FaApple } from "react-icons/fa";
import { SiGoogle } from "react-icons/si";

import "../GirisEkranı.css"

const GirisEkrani = ({ setGirisYapildiMi, setKullaniciAdi, setGoogleUser }) => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;

      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const userInfo = await userInfoRes.json();
        const ad = userInfo.name || userInfo.email?.split("@")[0] || "Kullanıcı";

        setKullaniciAdi(ad);
        setGoogleUser({ ...userInfo, access_token: accessToken });
        localStorage.setItem("kullaniciAdi", ad);
        localStorage.setItem("googleUser", JSON.stringify({ ...userInfo, access_token: accessToken }));
        setGirisYapildiMi(true);
      } catch (err) {
        console.error("Kullanıcı bilgileri alınamadı:", err);
        alert("Google ile giriş sırasında bir hata oluştu.");
      }
    },
    onError: () => alert("Google ile giriş başarısız."),
    scope: "https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
  });

  const handleAppleClick = () => {
    alert("Apple ile giriş şu anda desteklenmiyor.");
  };

  return (
    <div className="login-fullscreen">

      {/* Slogan - Sol üstte */}
      <div className="giris-slogan">
        <h1>
          plan,<br />
          düzen<br />
          <span className="giris-slogan-vurgulu">& smile.</span>
        </h1>
      </div>

      {/* Login kartı */}
      <div className="login-card" style={{
        backgroundImage: "url('/logincardbr.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat" }}>
        <img src="\logo.png" alt="Logo" className="giris-logo" />
        <p>Giriş yap, planlamaya başla.</p>

        <button onClick={() => login()} className="google-btn">
        <SiGoogle size={18} />
          Google ile Oturum Aç
        </button>

        <button onClick={handleAppleClick} className="apple-btn">
          <FaApple size={18} />
          Apple ile Giriş
        </button>

        <p className="giris-alt-yazi">
          Giriş yaparak{" "}
          <a href="#">Kullanım Şartlarını</a> kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
};

export default GirisEkrani;
