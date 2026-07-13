import { useEffect, useState } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../../../firebase";
import Aside from "../../Aside/Aside";
import Main from "../Main";

const Home = () => {
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const q = query(collection(db, "properties"), limit(30));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHouses(data);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHouses();
  }, []);

  const handleRegionChange = (regionName) => {
    setSelectedRegions((prev) =>
      prev.includes(regionName)
        ? prev.filter((r) => r !== regionName)
        : [...prev, regionName],
    );
  };

  return (
    <div className="max-w-[1320px] mx-auto px-[15px] xl:px-[20px] flex flex-col lg:flex-row items-start gap-5 lg:gap-[30px] mt-[30px] mb-[50px]">
      <div className="w-full lg:w-[280px] flex-shrink-0">
        <Aside
          selectedRegions={selectedRegions}
          onRegionChange={handleRegionChange}
          houses={houses}
          minPrice={minPrice}
          maxPrice={maxPrice}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          peopleCount={peopleCount}
          setPeopleCount={setPeopleCount}
        />
      </div>
      <div className="flex-1 w-full overflow-hidden">
        <Main
          selectedRegions={selectedRegions}
          houses={houses}
          loading={loading}
          minPrice={minPrice}
          maxPrice={maxPrice}
          peopleCount={peopleCount}
        />
      </div>
    </div>
  );
};

export default Home;
