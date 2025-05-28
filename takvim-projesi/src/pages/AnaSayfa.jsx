import UstMenu from "../components/UstMenu";
import YanPanel from "../components/YanPanel";
import TakvimGorunum from "../components/TakvimGorunum";

const AnaSayfa = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Üst Menü */}
      <UstMenu />
      
      <div className="flex flex-grow">
        {/* Sol Panel */}
        <YanPanel />
        
        {/* Takvim Görünümü */}
        <TakvimGorunum />
      </div>
    </div>
  );
};

export default AnaSayfa;
