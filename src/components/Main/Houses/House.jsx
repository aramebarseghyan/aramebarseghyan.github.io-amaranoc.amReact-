import { useState } from "react";
import { qardImg, qartName, qardPeople, qardPrice } from "../Code";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { userCardStore } from "../../../store/useCartStore";
import { Heart } from "lucide-react";

const House = () => {
  const increment = userCardStore((state) => state.increment);
  const decrement = userCardStore((state) => state.decrement);

  const [likedCards, setLikedCards] = useState({});

  const handleHeartClick = (e, index) => {
    e.preventDefault();

    if (likedCards[index]) {
      setLikedCards((prev) => ({ ...prev, [index]: false }));
      decrement();
    } else {
      setLikedCards((prev) => ({ ...prev, [index]: true }));
      increment();
    }
  };

  return (
    <div className="flex flex-wrap gap-5 w-full mt-6">
      {qardImg.map((imgUrl, index) => (
        <Link
          to={`/house/${index}`}
          key={index}
          className="w-[calc((100%-40px)/3)] flex flex-col rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-white transition-transform duration-200 hover:scale-[1.02]"
        >
          <img
            src={imgUrl}
            alt={qartName[index]}
            className="w-full h-60 object-cover"
          />

          <div className="p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="flex items-center m-0 font-sans text-[20px] text-[#222]">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  style={{ color: "orange", marginRight: "8px" }}
                />
                {qartName[index]}
              </h3>

              <button
                onClick={(e) => handleHeartClick(e, index)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Heart
                  size={20}
                  className={`transition-colors duration-300 ${
                    likedCards[index]
                      ? "text-red-500 fill-red-500"
                      : "text-gray-400"
                  }`}
                />
              </button>
            </div>

            <p className="text-[15px] font-sans text-[#666] m-0">
              {qardPeople[index]} անձ
            </p>

            <p className="font-sans text-[18px] font-bold text-black m-0">
              {qardPrice[index]} ֏
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default House;
