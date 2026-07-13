import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { userCardStore } from "../../../store/useCartStore";
import { Heart } from "lucide-react";

const House = ({
  selectedRegions,
  houses,
  loading,
  minPrice,
  maxPrice,
  peopleCount,
}) => {
  const [likedCards, setLikedCards] = useState({});
  const increment = userCardStore((state) => state.increment);
  const decrement = userCardStore((state) => state.decrement);

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
      <div className="w-full text-center py-10 text-gray-500">
        Բեռնվում է...
      </div>
    );
  }

  const filteredHouses = houses.filter((house) => {
    const matchesRegion =
      !selectedRegions ||
      selectedRegions.length === 0 ||
      selectedRegions.some(
        (region) => house.location && house.location.includes(region),
      );

    const housePriceNum = house.price
      ? parseInt(house.price.toString().replace(/[^0-9]/g, ""), 10)
      : 0;
    const matchesMinPrice =
      !minPrice || minPrice === "" || housePriceNum >= parseInt(minPrice, 10);
    const matchesMaxPrice =
      !maxPrice || maxPrice === "" || housePriceNum <= parseInt(maxPrice, 10);

    const capacityNum = house.capacity
      ? parseInt(house.capacity.toString().replace(/[^0-9]/g, ""), 10)
      : 0;
    const matchesPeople =
      !peopleCount || capacityNum >= parseInt(peopleCount, 10);

    return matchesRegion && matchesMinPrice && matchesMaxPrice && matchesPeople;
  });

  return (
    <div className="flex flex-wrap gap-5 w-full mt-6">
      {filteredHouses.map((house) => (
        <Link
          to={`/house/${house.id}`}
          key={house.id}
          className="w-full sm:w-[calc((100%-20px)/2)] lg:w-[calc((100%-40px)/3)] flex flex-col rounded-[15px] overflow-hidden bg-white transition-transform duration-200 hover:scale-[1.02]"
        >
          <img
            src={house.image}
            alt="house"
            className="w-full h-[220px] object-cover rounded-t-[15px]"
          />
          <div className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h3 className="flex items-center text-[16px] text-[#222] font-semibold m-0">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  style={{ color: "#fca34d", marginRight: "6px" }}
                />
                {house.location || "Լոկացիա"}
              </h3>
              <button
                onClick={(e) => handleHeartClick(e, house.id)}
                className="border-none bg-transparent cursor-pointer"
              >
                <Heart
                  size={20}
                  className={
                    likedCards[house.id]
                      ? "text-red-500 fill-red-500"
                      : "text-gray-300"
                  }
                />
              </button>
            </div>
            <p className="text-[14px] text-gray-500 m-0">{house.capacity}</p>
            <p className="text-[16px] font-bold text-[#1a1a1a] m-0">
              {house.price}
            </p>
          </div>
        </Link>
      ))}
      {filteredHouses.length === 0 && (
        <div className="w-full text-center py-10 text-gray-400">
          Այս պայմաններով տներ չեն գտնվել:
        </div>
      )}
    </div>
  );
};

export default House;
