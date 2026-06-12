import { qardImg, qartName, qardPeople, qardPrice } from "../Code";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { userCardStore } from "../../../store/useCartStore";

const House = () => {
  const increment = userCardStore((state) => state.increment);

  const handleAddClick = (e) => {
    e.preventDefault(); 
    increment();
  };

  return (
    <div className="flex flex-wrap gap-5 w-full mt-6">
      {qardImg.map((imgUrl, index) => (
        <Link
          to={`/house/${index}`}
          key={index}
          className="w-[calc((100%-40px)/3)] flex flex-col rounded-[12px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-white transition-transform duration-200 hover:scale-[1.02]"
        >
          <img
            src={imgUrl}
            alt={qartName[index]}
            className="w-full h-[240px] object-cover"
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

              {/* КНОПКА ДОБАВЛЕНИЯ */}
              <button
                onClick={handleAddClick}
                className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} />
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
