import { useState } from "react";

const freeRooms = ["Բոլորը", 1, 2, 3, 4, 5, "6 և ավելի"];

const Rooms = () => {
  const [active, setActive] = useState(1);

  return (
    <div className="absolute top-[920px] w-full  border-t border-[#f0f0f0]">
      <h4 className=" absolute top-5  left-7 text-[16px] font-bold mb-4 text-[#111]">Սենյակների քանակ</h4>
      <div className="relative left-6 top-15 flex flex-wrap gap-2 w-full">
        {freeRooms.map((room, index) => {
          let widthClass = "w-[54px]";
          if (index === 0) widthClass = "w-[80px]";
          if (index === 6) widthClass = "w-[110px]";

          return (
            <div

              key={room}
              onClick={() => setActive(room)}
              className={` h-[56px] rounded-full border flex items-center justify-center cursor-pointer text-[15px] transition-all duration-200 ${widthClass} ${
                active === room
                  ? "bg-[#111] text-white border-[#111]"
                  : "bg-white border-[#ddd] text-[#555] hover:border-[#aaa]"
              }`}
            >
              {room}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Rooms;