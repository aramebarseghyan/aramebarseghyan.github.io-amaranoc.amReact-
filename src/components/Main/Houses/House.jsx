import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { userCardStore } from "../../../store/useCartStore";
import { Heart } from "lucide-react";

const House = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedCards, setLikedCards] = useState({});

  const increment = userCardStore((state) => state.increment);
  const decrement = userCardStore((state) => state.decrement);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "properties"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHouses(data);
      } catch (error) {
        console.error("Ошибка загрузки данных из Firebase:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHouses();
  }, []);

  const handleHeartClick = (e, id) => {
    e.preventDefault();
    if (likedCards[id]) {
      setLikedCards((prev) => ({ ...prev, [id]: false }));
      decrement();
    } else {
      setLikedCards((prev) => ({ ...prev, [id]: true }));
      increment();
    }
  };

  if (loading) {
    return (
      <div className="w-full text-center py-10 font-sans text-xl text-gray-500">
        Загрузка карточек из базы...
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-5 w-full mt-6">
      {houses.map((house) => (
        <Link
          to={`/house/${house.id}`}
          key={house.id}
          className="w-[calc((100%-40px)/3)] flex flex-col rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-white transition-transform duration-200 hover:scale-[1.02]"
        >
          <img
            src={house.imageUrl || house.imgUrl}
            alt={house.name}
            className="w-full h-60 object-cover"
          />

          <div className="p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="flex items-center m-0 font-sans text-[20px] text-[#222]">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  style={{ color: "orange", marginRight: "8px" }}
                />
                {house.name}
              </h3>

              <button
                onClick={(e) => handleHeartClick(e, house.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Heart
                  size={20}
                  className={`transition-colors duration-300 ${
                    likedCards[house.id]
                      ? "text-red-500 fill-red-500"
                      : "text-gray-400"
                  }`}
                />
              </button>
            </div>

            <p className="text-[15px] font-sans text-[#666] m-0">
              {house.people} անձ
            </p>

            <p className="font-sans text-[18px] font-bold text-black m-0">
              {house.price} ֏
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default House;
